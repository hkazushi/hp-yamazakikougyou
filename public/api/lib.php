<?php
// 共通処理。データは公開フォルダの外（既定: public_html の隣の yk-data/）に置く
if (!defined('YK')) {
    http_response_code(404);
    exit;
}

date_default_timezone_set('Asia/Tokyo');

const IMAGE_URL_PATTERN = '#^/api/image\.php\?f=([a-f0-9]{32}\.(?:jpg|png|webp))$#';

function data_dir(): string
{
    $dir = getenv('YK_DATA_DIR') ?: dirname(__DIR__, 2) . '/yk-data';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        fail('データ用フォルダを作成できません。', 500);
    }
    // 公開領域に置かれてしまった場合の保険
    $guard = $dir . '/.htaccess';
    if (!is_file($guard)) {
        @file_put_contents($guard, "Require all denied\n");
    }
    return $dir;
}

function upload_dir(): string
{
    $dir = data_dir() . '/uploads';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        fail('画像用フォルダを作成できません。', 500);
    }
    return $dir;
}

function config(): array
{
    static $config = null;
    if ($config === null) {
        $file = data_dir() . '/config.php';
        $config = is_file($file) ? require $file : [];
    }
    return is_array($config) ? $config : [];
}

function json_out(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): void
{
    json_out(['error' => $message], $status);
}

function str_length(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}

function text($value): string
{
    return is_string($value) ? trim($value) : '';
}

function read_json(string $name, $default)
{
    $file = data_dir() . "/$name.json";
    if (!is_file($file)) {
        return $default;
    }
    $data = json_decode((string) file_get_contents($file), true);
    // 壊れたファイルを空として扱うと、次の保存で全データを消してしまう
    if (!is_array($data)) {
        fail('データファイルを読み込めません。', 500);
    }
    return $data;
}

// 排他ロックの中で読み込み→変更→保存する。一時ファイルからの rename で途中状態を残さない
function update_json(string $name, $default, callable $change)
{
    $dir = data_dir();
    $lock = fopen("$dir/$name.lock", 'c');
    if (!$lock || !flock($lock, LOCK_EX)) {
        fail('データを保存できません。', 500);
    }
    try {
        $data = read_json($name, $default);
        $result = $change($data);
        $tmp = "$dir/$name." . bin2hex(random_bytes(6)) . '.tmp';
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        if ($json === false || file_put_contents($tmp, $json) === false || !rename($tmp, "$dir/$name.json")) {
            @unlink($tmp);
            fail('データを保存できません。', 500);
        }
        return $result;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

// お客さんに見せるためのテスト投稿。posts.json が無い初回だけ入り、削除すれば戻らない
function seed_posts(): array
{
    $at = '2026-11-06T09:00:00+09:00';
    $post = fn(string $id, string $type, string $title, string $date, array $images, string $body = '') => [
        'id' => $id, 'type' => $type, 'title' => $title, 'body' => $body, 'images' => $images,
        'published' => true, 'date' => $date, 'created_at' => $at, 'updated_at' => $at,
    ];
    return [
        $post('sample-work-1', 'work', 'マンション一室 スケルトン工事（テスト投稿）', '2026-11-03', ['/img/site-1.jpg', '/img/gen-finish.jpg']),
        $post('sample-work-2', 'work', 'オフィス 内装解体工事（テスト投稿）', '2026-10-24', ['/img/site-2.jpg', '/img/gen-stacked.jpg']),
        $post('sample-news-1', 'news', 'ホームページを公開しました（テスト投稿）', '2026-11-06', [], "このたび、株式会社山﨑工業のホームページを公開しました。\n施工例やお知らせなどを掲載してまいります。"),
        $post('sample-news-2', 'news', '写真付きのお知らせ（テスト投稿）', '2026-10-30', ['/img/gen-entrance.jpg'], 'お知らせは、文章だけでも、写真付きでも投稿できます。'),
    ];
}

function all_posts(): array
{
    $posts = read_json('posts', seed_posts());
    usort($posts, fn($a, $b) => [$b['date'], $b['created_at']] <=> [$a['date'], $a['created_at']]);
    return $posts;
}

function valid_id($id): bool
{
    return is_string($id) && preg_match('/^[a-z0-9-]{1,64}$/', $id) === 1;
}

function own_image($url): bool
{
    return is_string($url)
        && (preg_match('#^/img/[\w.-]+$#', $url) === 1 || preg_match(IMAGE_URL_PATTERN, $url) === 1);
}

function delete_images(array $urls): void
{
    foreach ($urls as $url) {
        if (is_string($url) && preg_match(IMAGE_URL_PATTERN, $url, $m)) {
            @unlink(upload_dir() . '/' . $m[1]);
        }
    }
}

// 総当たりやスパムを遅らせるための回数制限（IPごと）
function over_limit(string $key, int $max, int $seconds): bool
{
    $hits = read_json('rate', [])[hash('sha256', $key)] ?? [];
    return count(array_filter($hits, fn($t) => $t > time() - $seconds)) >= $max;
}

function record_hit(string $key, int $seconds): void
{
    update_json('rate', [], function (array &$rate) use ($key, $seconds) {
        $now = time();
        foreach ($rate as $k => $hits) {
            $rate[$k] = array_values(array_filter($hits, fn($t) => $t > $now - 86400));
            if (!$rate[$k]) {
                unset($rate[$k]);
            }
        }
        $rate[hash('sha256', $key)][] = $now;
    });
}

function clear_hits(string $key): void
{
    update_json('rate', [], function (array &$rate) use ($key) {
        unset($rate[hash('sha256', $key)]);
    });
}

function client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function start_admin_session(): void
{
    $dir = data_dir() . '/sessions';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    session_save_path($dir);
    $lifetime = 60 * 60 * 24 * 7;
    ini_set('session.gc_maxlifetime', (string) $lifetime);
    ini_set('session.gc_probability', '1');
    ini_set('session.gc_divisor', '100');
    ini_set('session.use_strict_mode', '1');
    session_name('yk_admin');
    session_set_cookie_params([
        'lifetime' => $lifetime,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Strict',
        'secure' => is_https(),
    ]);
    session_start();
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
}

function is_admin(): bool
{
    return !empty($_SESSION['admin']);
}

function require_admin(): void
{
    if (!is_admin()) {
        fail('ログインしてください。', 401);
    }
}

// 別サイトからの送信を拒否する。専用ヘッダーは別オリジンから付けられない
function require_same_origin_post(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        fail('不正なリクエストです。', 405);
    }
    if (($_SERVER['HTTP_X_YK_REQUEST'] ?? '') !== '1') {
        fail('不正なリクエストです。', 403);
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $parts = parse_url($origin);
        $host = ($parts['host'] ?? '') . (isset($parts['port']) ? ':' . $parts['port'] : '');
        if (!hash_equals((string) ($_SERVER['HTTP_HOST'] ?? ''), $host)) {
            fail('不正なリクエストです。', 403);
        }
    }
}

function json_body(): array
{
    $body = json_decode((string) file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

// config.php の notify_to と mail_from が両方あるときだけ送る。失敗しても受付は成立させる
function notify_inquiry(array $row): void
{
    $to = config()['notify_to'] ?? '';
    $from = config()['mail_from'] ?? '';
    if ($to === '' || $from === '' || !function_exists('mb_send_mail')) {
        return;
    }
    mb_language('uni');
    mb_internal_encoding('UTF-8');
    $oneLine = fn(string $s) => str_replace(["\r", "\n"], ' ', $s);
    $body = "ホームページからお問い合わせがありました。\n\n"
        . "種別: {$row['kind']}\n会社名: {$row['company']}\nお名前: {$row['name']}\n"
        . "TEL: {$row['phone']}\nE-mail: {$row['email']}\n\n{$row['message']}\n";
    $headers = 'From: ' . $oneLine($from) . "\r\nReply-To: " . $oneLine($row['email']);
    if (!@mb_send_mail($to, '【HP】' . $oneLine($row['kind']) . '（' . $oneLine($row['name']) . '様）', $body, $headers)) {
        error_log('yk: contact notify failed');
    }
}
