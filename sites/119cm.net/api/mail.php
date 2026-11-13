<?php
/*
 * 医療介護総合支援会：自動メールの送信口（Apps Script → ここ → Xサーバーから info@119cm.net で送る）
 * 送れるのは、Google が発行した「本人確認の札（IDトークン）」を持つ、決められたアカウント（Apps Script の持ち主）だけ。
 * 合言葉（パスワード）をここに置かないので、公開の GitHub に載っても安全。
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

const FROM_ADDR   = 'info@119cm.net';
const FROM_NAME   = '医療介護総合支援会';
const ALLOWED     = ['ikshienkai@gmail.com'];          // Apps Script を動かしている Google アカウント
const MAX_TO      = 5;                                // 1通あたりのあて先の上限（to/cc/bcc の合計）
const MAX_BYTES   = 12 * 1024 * 1024;                 // 添付を含めた大きさの上限
const DAY_LIMIT   = 500;                              // 1日に送れる通数の上限（いたずら対策）
const CERT_URL    = 'https://www.googleapis.com/oauth2/v1/certs';

function out(int $code, array $o): void { http_response_code($code); echo json_encode($o, JSON_UNESCAPED_UNICODE); exit; }
function b64url(string $s): string { return base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4)) ?: ''; }
function dataDir(): string { $d = dirname(__DIR__, 2) . '/mailrelay_data'; if (!is_dir($d)) @mkdir($d, 0700, true); return is_dir($d) ? $d : sys_get_temp_dir(); }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok' => false, 'error' => 'POST only']);

/* ---- 本人確認（Google の IDトークン） ---- */
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
$raw = file_get_contents('php://input', false, null, 0, MAX_BYTES * 2) ?: '';
$req = json_decode($raw, true);
if (!is_array($req)) out(400, ['ok' => false, 'error' => 'bad json']);
$jwt = preg_match('/^Bearer\s+(\S+)$/', $auth, $m) ? $m[1] : (string)($req['idToken'] ?? '');
$parts = explode('.', $jwt);
if (count($parts) !== 3) out(401, ['ok' => false, 'error' => 'no token']);
$head = json_decode(b64url($parts[0]), true); $claim = json_decode(b64url($parts[1]), true);
if (!is_array($head) || !is_array($claim) || ($head['alg'] ?? '') !== 'RS256' || empty($head['kid'])) out(401, ['ok' => false, 'error' => 'bad token']);

$cacheFile = dataDir() . '/google_certs.json';
$certs = null;
if (is_file($cacheFile) && time() - filemtime($cacheFile) < 3600) $certs = json_decode((string)file_get_contents($cacheFile), true);
if (!is_array($certs) || empty($certs[$head['kid']])) {
  $txt = false;
  if (function_exists('curl_init')) { $ch = curl_init(CERT_URL); curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8]); $txt = curl_exec($ch); curl_close($ch); }
  if (!$txt) { $ctx = stream_context_create(['http' => ['timeout' => 8]]); $txt = @file_get_contents(CERT_URL, false, $ctx); }
  $certs = $txt ? json_decode($txt, true) : null;
  if (is_array($certs)) @file_put_contents($cacheFile, $txt, LOCK_EX);
}
if (!is_array($certs)) out(503, ['ok' => false, 'error' => 'cert fetch failed']);
if (empty($certs[$head['kid']])) out(401, ['ok' => false, 'error' => 'unknown key']);
$pub = openssl_pkey_get_public($certs[$head['kid']]);
if (!$pub || openssl_verify($parts[0] . '.' . $parts[1], b64url($parts[2]), $pub, OPENSSL_ALGO_SHA256) !== 1) out(401, ['ok' => false, 'error' => 'signature']);
$now = time();
if (!in_array($claim['iss'] ?? '', ['accounts.google.com', 'https://accounts.google.com'], true)) out(401, ['ok' => false, 'error' => 'issuer']);
if (($claim['exp'] ?? 0) < $now - 60 || ($claim['iat'] ?? 0) > $now + 300) out(401, ['ok' => false, 'error' => 'expired']);
if (!in_array(strtolower((string)($claim['email'] ?? '')), ALLOWED, true) || empty($claim['email_verified'])) out(403, ['ok' => false, 'error' => 'not allowed']);

/* ---- 1日の上限 ---- */
$cntFile = dataDir() . '/count_' . date('Ymd') . '.txt';
$cnt = (int)@file_get_contents($cntFile);
if ($cnt >= DAY_LIMIT) out(429, ['ok' => false, 'error' => 'daily limit']);

/* ---- 中身の確認 ---- */
$addr = function ($v): array {
  $l = is_array($v) ? $v : preg_split('/\s*,\s*/', (string)$v, -1, PREG_SPLIT_NO_EMPTY);
  $o = [];
  foreach ($l as $a) { $a = trim((string)$a); if ($a === '') continue; if (!filter_var($a, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $a)) out(400, ['ok' => false, 'error' => 'bad address']); $o[] = $a; }
  return $o;
};
$to = $addr($req['to'] ?? ''); $cc = $addr($req['cc'] ?? ''); $bcc = $addr($req['bcc'] ?? '');
$replyTo = $addr($req['replyTo'] ?? FROM_ADDR);
if (!$to) out(400, ['ok' => false, 'error' => 'no recipient']);
if (count($to) + count($cc) + count($bcc) > MAX_TO) out(400, ['ok' => false, 'error' => 'too many recipients']);
$subject = preg_replace('/[\r\n]+/', ' ', (string)($req['subject'] ?? ''));
$text = (string)($req['body'] ?? ''); $html = (string)($req['htmlBody'] ?? '');
$name = preg_replace('/[\r\n"]+/', ' ', (string)($req['name'] ?? FROM_NAME));
if ($subject === '' || ($text === '' && $html === '')) out(400, ['ok' => false, 'error' => 'empty']);

/* ---- メールを組み立てる（日本語は UTF-8・base64） ---- */
$enc = function (string $s): string { return '=?UTF-8?B?' . base64_encode($s) . '?='; };
$crlf = "\r\n";
$b1 = '=_b1_' . bin2hex(random_bytes(8)); $b2 = '=_b2_' . bin2hex(random_bytes(8));
$textPart = 'Content-Type: text/plain; charset=UTF-8' . $crlf . 'Content-Transfer-Encoding: base64' . $crlf . $crlf . chunk_split(base64_encode($text !== '' ? $text : strip_tags($html)));
$body = $textPart; $ctype = 'text/plain; charset=UTF-8'; $isMulti = false;
if ($html !== '') {
  $body = '--' . $b2 . $crlf . $textPart . '--' . $b2 . $crlf . 'Content-Type: text/html; charset=UTF-8' . $crlf . 'Content-Transfer-Encoding: base64' . $crlf . $crlf . chunk_split(base64_encode($html)) . '--' . $b2 . '--' . $crlf;
  $ctype = 'multipart/alternative; boundary="' . $b2 . '"'; $isMulti = true;
}
$atts = is_array($req['attachments'] ?? null) ? $req['attachments'] : [];
if ($atts) {
  $mixed = '--' . $b1 . $crlf . 'Content-Type: ' . $ctype . $crlf . ($isMulti ? '' : 'Content-Transfer-Encoding: base64' . $crlf) . $crlf . ($isMulti ? $body : chunk_split(base64_encode($text !== '' ? $text : strip_tags($html))));
  foreach (array_slice($atts, 0, 5) as $a) {
    $fn = preg_replace('/[\r\n"\\\\\/]+/', '_', (string)($a['name'] ?? 'file.pdf'));
    $mt = preg_match('/^[\w.+-]+\/[\w.+-]+$/', (string)($a['type'] ?? '')) ? $a['type'] : 'application/octet-stream';
    $data = base64_decode((string)($a['data'] ?? ''), true); if ($data === false) out(400, ['ok' => false, 'error' => 'bad attachment']);
    $mixed .= '--' . $b1 . $crlf . 'Content-Type: ' . $mt . '; name="' . $enc($fn) . '"' . $crlf . 'Content-Transfer-Encoding: base64' . $crlf . 'Content-Disposition: attachment; filename="' . $enc($fn) . '"' . $crlf . $crlf . chunk_split(base64_encode($data));
  }
  $body = $mixed . '--' . $b1 . '--' . $crlf; $ctype = 'multipart/mixed; boundary="' . $b1 . '"';
}
if (strlen($body) > MAX_BYTES) out(413, ['ok' => false, 'error' => 'too large']);
$headers = 'From: ' . $enc($name) . ' <' . FROM_ADDR . '>' . $crlf . 'Reply-To: ' . implode(', ', $replyTo) . $crlf
  . ($cc ? 'Cc: ' . implode(', ', $cc) . $crlf : '') . ($bcc ? 'Bcc: ' . implode(', ', $bcc) . $crlf : '')
  . 'MIME-Version: 1.0' . $crlf . 'Content-Type: ' . $ctype . $crlf . ($isMulti || $atts ? '' : 'Content-Transfer-Encoding: base64' . $crlf)
  . 'Message-ID: <' . bin2hex(random_bytes(12)) . '@119cm.net>' . $crlf . 'X-Mailer: 119cm-relay';
$ok = mail(implode(', ', $to), $enc($subject), ($isMulti || $atts) ? $body : chunk_split(base64_encode($text)), $headers, '-f' . FROM_ADDR);
if (!$ok) out(500, ['ok' => false, 'error' => 'send failed']);
@file_put_contents($cntFile, (string)($cnt + 1), LOCK_EX);
out(200, ['ok' => true]);
