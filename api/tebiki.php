<?php
// 家じまい123：「家じまいの手引き書」を鍵をかけたまま預かる
// ・中身は利用者の端末で暗号化されてから届く。ここでは読めない（合言葉も届かない）
// ・照合には、合言葉から作った値をさらに変換したもの（SHA-256）だけを保管する
// ・保管場所は公開フォルダの外
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

const MAX_DATA  = 3 * 1024 * 1024;  // 預かる内容の上限（暗号化後・文字にした大きさ）
const MAX_IP_HR = 120;              // 1つの接続元からの操作の上限（1時間）
const MAX_FAIL  = 10;               // 1つの預かり番号への合言葉の間違いの上限（1時間）
const ALPHA     = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function out(array $a, int $code = 200): void {
  http_response_code($code);
  echo json_encode($a, JSON_UNESCAPED_UNICODE);
  exit;
}
function fail(string $e, int $code = 400): void { out(['ok' => false, 'error' => $e], $code); }

$dir = dirname(__DIR__, 2) . '/.tebiki_vault';
if (!is_dir($dir) && !@mkdir($dir, 0700, true)) fail('server', 500);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('method', 405);
$raw = file_get_contents('php://input', false, null, 0, MAX_DATA + 65536);
if ($raw === false || strlen($raw) > MAX_DATA + 65535) fail('size', 413);
$j = json_decode($raw, true);
if (!is_array($j)) fail('json');

// 接続元ごとの操作回数（接続元はそのまま残さず、変換した値で数える）
$ipKey = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|tebiki'), 0, 24);
$rl = $dir . '/.rate_' . $ipKey;
$now = time();
$hits = is_file($rl) ? array_filter(array_map('intval', file($rl, FILE_IGNORE_NEW_LINES)), fn($t) => $t > $now - 3600) : [];
if (count($hits) >= MAX_IP_HR) fail('rate', 429);
$hits[] = $now;
file_put_contents($rl, implode("\n", $hits), LOCK_EX);

function b64ok($s, int $max): bool { return is_string($s) && $s !== '' && strlen($s) <= $max && preg_match('/^[A-Za-z0-9+\/]+=*$/', $s); }
function idok($s): bool { return is_string($s) && preg_match('/^[' . ALPHA . ']{12}$/', $s) === 1; }
function path(string $dir, string $id): string { return $dir . '/' . $id . '.json'; }
function rec(string $dir, string $id): array {
  $p = path($dir, $id);
  if (!is_file($p)) fail('notfound', 404);
  $r = json_decode((string)file_get_contents($p), true);
  if (!is_array($r)) fail('server', 500);
  return $r;
}
function check(string $dir, string $id, array $r, $auth): void {
  $fp = $dir . '/.fail_' . $id; $now = time();
  $f = is_file($fp) ? array_filter(array_map('intval', file($fp, FILE_IGNORE_NEW_LINES)), fn($t) => $t > $now - 3600) : [];
  if (count($f) >= MAX_FAIL) fail('locked', 429);
  if (!is_string($auth) || !preg_match('/^[0-9a-f]{64}$/', $auth) || !hash_equals((string)$r['authHash'], hash('sha256', $auth))) {
    $f[] = $now; file_put_contents($fp, implode("\n", $f), LOCK_EX);
    usleep(300000);
    fail('auth', 403);
  }
}

$op = (string)($j['op'] ?? '');
switch ($op) {
  case 'create':
    if (!b64ok($j['salt'] ?? null, 64) || !b64ok($j['iv'] ?? null, 64) || !b64ok($j['data'] ?? null, MAX_DATA)) fail('bad');
    if (!is_string($j['authHash'] ?? null) || !preg_match('/^[0-9a-f]{64}$/', $j['authHash'])) fail('bad');
    for ($n = 0; $n < 10; $n++) {
      $id = ''; for ($i = 0; $i < 12; $i++) $id .= ALPHA[random_int(0, strlen(ALPHA) - 1)];
      if (!is_file(path($dir, $id))) break;
    }
    $r = ['salt' => $j['salt'], 'authHash' => $j['authHash'], 'iv' => $j['iv'], 'data' => $j['data'], 'created' => date('c'), 'updated' => date('c')];
    if (file_put_contents(path($dir, $id), json_encode($r), LOCK_EX) === false) fail('server', 500);
    @chmod(path($dir, $id), 0600);
    out(['ok' => true, 'id' => $id]);
  case 'salt':
    if (!idok($j['id'] ?? null)) fail('notfound', 404);
    $r = rec($dir, $j['id']);
    out(['ok' => true, 'salt' => $r['salt']]);
  case 'load':
    if (!idok($j['id'] ?? null)) fail('notfound', 404);
    $r = rec($dir, $j['id']); check($dir, $j['id'], $r, $j['auth'] ?? null);
    out(['ok' => true, 'iv' => $r['iv'], 'data' => $r['data'], 'updated' => $r['updated']]);
  case 'save':
    if (!idok($j['id'] ?? null)) fail('notfound', 404);
    if (!b64ok($j['iv'] ?? null, 64) || !b64ok($j['data'] ?? null, MAX_DATA)) fail('bad');
    $r = rec($dir, $j['id']); check($dir, $j['id'], $r, $j['auth'] ?? null);
    $r['iv'] = $j['iv']; $r['data'] = $j['data']; $r['updated'] = date('c');
    if (file_put_contents(path($dir, $j['id']), json_encode($r), LOCK_EX) === false) fail('server', 500);
    out(['ok' => true, 'id' => $j['id']]);
  case 'delete':
    if (!idok($j['id'] ?? null)) fail('notfound', 404);
    $r = rec($dir, $j['id']); check($dir, $j['id'], $r, $j['auth'] ?? null);
    @unlink(path($dir, $j['id']));
    out(['ok' => true]);
  default:
    fail('bad');
}
