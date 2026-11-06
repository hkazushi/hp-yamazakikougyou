<?php
// アップロード画像の配信。実体は公開フォルダの外にあるので、デプロイで上書きしても消えない
define('YK', true);
require __DIR__ . '/lib.php';

$name = $_GET['f'] ?? '';
if (!is_string($name) || !preg_match('/^[a-f0-9]{32}\.(jpg|png|webp)$/', $name, $m)) {
    http_response_code(404);
    exit;
}
$file = upload_dir() . "/$name";
if (!is_file($file)) {
    http_response_code(404);
    exit;
}
header('Content-Type: ' . ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'][$m[1]]);
header('Content-Length: ' . filesize($file));
header('Cache-Control: public, max-age=31536000, immutable');
header('X-Content-Type-Options: nosniff');
readfile($file);
