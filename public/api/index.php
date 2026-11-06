<?php
// 投稿・ログイン・お問い合わせの API。?action= で処理を選ぶ
define('YK', true);
require __DIR__ . '/lib.php';

const INQUIRY_KINDS = ['工事のご相談・お見積り', '求人への応募', '協力業者様のお問い合わせ', 'その他'];

$action = $_GET['action'] ?? '';

// ---- 公開 ----
if ($action === 'posts') {
    $type = $_GET['type'] ?? '';
    $posts = array_values(array_filter(all_posts(), fn($p) => $p['published'] && $p['type'] === $type));
    $limit = (int) ($_GET['limit'] ?? 0);
    json_out(['posts' => $limit > 0 ? array_slice($posts, 0, $limit) : $posts]);
}

if ($action === 'post') {
    foreach (all_posts() as $post) {
        if ($post['id'] === ($_GET['id'] ?? '') && $post['type'] === 'news' && $post['published']) {
            json_out(['post' => $post]);
        }
    }
    fail('お知らせが見つかりません。', 404);
}

if ($action === 'contact') {
    require_same_origin_post();
    $in = json_body();
    // ボット用の隠し項目。入っていたら保存せず成功に見せる
    if (text($in['website'] ?? '') !== '') {
        json_out(['ok' => true]);
    }
    $row = [];
    foreach (['kind', 'company', 'name', 'phone', 'email', 'message'] as $key) {
        $row[$key] = text($in[$key] ?? '');
    }
    if (!in_array($row['kind'], INQUIRY_KINDS, true)) fail('お問い合わせ種別を選択してください。');
    if ($row['name'] === '') fail('お名前を入力してください。');
    if (!filter_var($row['email'], FILTER_VALIDATE_EMAIL)) fail('メールアドレスを正しく入力してください。');
    if ($row['message'] === '') fail('お問い合わせ内容を入力してください。');
    if (($in['agree'] ?? false) !== true) fail('プライバシーポリシーへの同意が必要です。');
    if (str_length($row['message']) > 5000 || str_length($row['name']) > 100 || str_length($row['company']) > 200
        || str_length($row['phone']) > 30 || str_length($row['email']) > 200) {
        fail('入力内容が長すぎます。');
    }
    $key = 'contact:' . client_ip();
    if (over_limit($key, 5, 600)) fail('送信が続いています。時間をおいて再度お試しください。', 429);
    record_hit($key, 600);

    update_json('inquiries', [], function (array &$list) use ($row) {
        $list[] = $row + ['id' => bin2hex(random_bytes(16)), 'read' => false, 'created_at' => date('c')];
    });
    notify_inquiry($row);
    json_out(['ok' => true]);
}

// ---- 管理 ----
start_admin_session();

if ($action === 'login') {
    require_same_origin_post();
    $key = 'login:' . client_ip();
    if (over_limit($key, 5, 900)) fail('ログインの失敗が続いたため、15分ほど待ってからお試しください。', 429);
    $in = json_body();
    $config = config();
    $user = (string) ($config['user'] ?? '');
    $hash = (string) ($config['password_hash'] ?? '');
    // 設定が無ければ誰もログインできない
    $ok = $user !== '' && $hash !== ''
        && hash_equals($user, text($in['user'] ?? ''))
        && password_verify((string) ($in['password'] ?? ''), $hash);
    if (!$ok) {
        record_hit($key, 900);
        fail('IDまたはパスワードが違います。', 401);
    }
    clear_hits($key);
    session_regenerate_id(true);
    $_SESSION['admin'] = true;
    json_out(['ok' => true]);
}

if ($action === 'logout') {
    require_same_origin_post();
    $_SESSION = [];
    setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => '/', 'httponly' => true, 'samesite' => 'Strict', 'secure' => is_https()]);
    session_destroy();
    json_out(['ok' => true]);
}

require_admin();

if ($action === 'me') {
    $unread = count(array_filter(read_json('inquiries', []), fn($q) => !$q['read']));
    json_out(['ok' => true, 'unread' => $unread]);
}

if ($action === 'admin_posts') {
    $type = $_GET['type'] ?? '';
    json_out(['posts' => array_values(array_filter(all_posts(), fn($p) => $p['type'] === $type))]);
}

if ($action === 'admin_post') {
    foreach (all_posts() as $post) {
        if ($post['id'] === ($_GET['id'] ?? '')) {
            json_out(['post' => $post]);
        }
    }
    fail('投稿が見つかりません。', 404);
}

if ($action === 'upload') {
    require_same_origin_post();
    $file = $_FILES['file'] ?? null;
    if (!$file || !is_uploaded_file($file['tmp_name'] ?? '') || ($file['error'] ?? 1) !== UPLOAD_ERR_OK) {
        fail('画像を受け取れませんでした。');
    }
    if ($file['size'] > 8 * 1024 * 1024) fail('画像が大きすぎます。', 413);
    $info = @getimagesize($file['tmp_name']);
    $ext = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'][$info[2] ?? 0] ?? null;
    if (!$ext) fail('JPEG / PNG / WebP の画像を選んでください。', 415);
    $name = bin2hex(random_bytes(16)) . ".$ext";
    if (!move_uploaded_file($file['tmp_name'], upload_dir() . "/$name")) {
        fail('画像を保存できませんでした。', 500);
    }
    json_out(['url' => "/api/image.php?f=$name"]);
}

if ($action === 'save_post') {
    require_same_origin_post();
    $in = json_body();
    $type = ($in['type'] ?? '') === 'work' ? 'work' : 'news';
    $title = text($in['title'] ?? '');
    $body = $type === 'news' ? text($in['body'] ?? '') : '';
    $date = text($in['date'] ?? '');
    $images = array_values(array_slice(array_filter((array) ($in['images'] ?? []), 'own_image'), 0, 20));
    $id = $in['id'] ?? null;

    if ($title === '') fail('タイトルを入力してください。');
    if (str_length($title) > 120) fail('タイトルは120文字以内にしてください。');
    if (str_length($body) > 20000) fail('本文が長すぎます。');
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m) || !checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
        fail('日付を入力してください。');
    }
    if ($type === 'work' && !$images) fail('施工例には写真を1枚以上入れてください。');
    if ($type === 'news' && $body === '' && !$images) fail('本文か写真を入れてください。');
    if ($id !== null && !valid_id($id)) fail('不正なリクエストです。');

    $removed = update_json('posts', seed_posts(), function (array &$posts) use ($id, $type, $title, $body, $date, $images, $in) {
        $row = [
            'type' => $type, 'title' => $title, 'body' => $body, 'images' => $images,
            'published' => ($in['published'] ?? false) === true, 'date' => $date, 'updated_at' => date('c'),
        ];
        if ($id === null) {
            $posts[] = $row + ['id' => bin2hex(random_bytes(16)), 'created_at' => date('c')];
            return [];
        }
        foreach ($posts as $i => $post) {
            if ($post['id'] === $id) {
                $posts[$i] = $row + $post;
                return array_values(array_diff($post['images'], $images));
            }
        }
        fail('この投稿は削除されています。', 404);
    });
    delete_images($removed);
    json_out(['ok' => true, 'type' => $type]);
}

if ($action === 'delete_post') {
    require_same_origin_post();
    $id = json_body()['id'] ?? '';
    $images = update_json('posts', seed_posts(), function (array &$posts) use ($id) {
        foreach ($posts as $i => $post) {
            if ($post['id'] === $id) {
                array_splice($posts, $i, 1);
                return $post['images'];
            }
        }
        return [];
    });
    delete_images($images);
    json_out(['ok' => true]);
}

if ($action === 'inquiries') {
    $list = read_json('inquiries', []);
    usort($list, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));
    json_out(['inquiries' => $list]);
}

if ($action === 'inquiry_read') {
    require_same_origin_post();
    $in = json_body();
    update_json('inquiries', [], function (array &$list) use ($in) {
        foreach ($list as $i => $q) {
            if ($q['id'] === ($in['id'] ?? '')) {
                $list[$i]['read'] = ($in['read'] ?? false) === true;
            }
        }
    });
    json_out(['ok' => true]);
}

if ($action === 'inquiry_delete') {
    require_same_origin_post();
    $id = json_body()['id'] ?? '';
    update_json('inquiries', [], function (array &$list) use ($id) {
        $list = array_values(array_filter($list, fn($q) => $q['id'] !== $id));
    });
    json_out(['ok' => true]);
}

fail('不正なリクエストです。', 404);
