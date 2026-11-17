<?php
// 企業支援 総合相談窓口：電子契約・管理画面からのメールを info@bsd.osaka から送る中継
// 合言葉そのものはここに置かず、照合用の値（SHA-256）だけを置く
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

// 照合用の値（管理システム。相談受付フォームのメールも管理システム経由で送る）
const KEY_HASHES = ['8973ff667fca84690b1bf98ae5d173de3721e930a2b6e38e4c4cfbd40ec19dc9'];
const FROM     = 'info@bsd.osaka';
const MAX_RCPT = 20;     // 1通あたりの宛先の上限
const MAX_HOUR = 300;    // 1時間あたりの送信の上限

function out(bool $ok, string $err = '', int $code = 200): void {
  http_response_code($code);
  echo json_encode(['ok' => $ok, 'error' => $err], JSON_UNESCAPED_UNICODE);
  exit;
}
function one_line($s): string { return trim(preg_replace('/[\r\n\t]+/', ' ', (string)$s)); }
function addrs($s): array {
  $r = [];
  foreach (preg_split('/[,;]+/', one_line($s)) as $a) {
    $a = trim($a);
    if ($a === '') continue;
    if (preg_match('/<([^>]+)>/', $a, $m)) $a = trim($m[1]);
    if (!filter_var($a, FILTER_VALIDATE_EMAIL)) out(false, 'bad address', 400);
    $r[] = $a;
  }
  return $r;
}
function enc($s): string { return mb_encode_mimeheader(one_line($s), 'UTF-8', 'B', "\r\n"); }
function b64($s): string { return rtrim(chunk_split(base64_encode($s), 76, "\r\n")); }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(false, 'method', 405);
$raw = file_get_contents('php://input', false, null, 0, 25 * 1024 * 1024 + 1);
if ($raw === false || strlen($raw) > 25 * 1024 * 1024) out(false, 'size', 413);
$j = json_decode($raw, true);
if (!is_array($j)) out(false, 'json', 400);
$okKey = false;
if (isset($j['key'])) { $h = hash('sha256', (string)$j['key']); foreach (KEY_HASHES as $kh) { if (strlen($kh) === 64 && hash_equals($kh, $h)) { $okKey = true; } } }
if (!$okKey) {
  usleep(400000);
  out(false, 'key', 403);
}

// 送りすぎの歯止め（記録は公開フォルダの外に置く）
$rl = dirname(__DIR__, 2) . '/.mail_relay_log';
$now = time(); $log = [];
if (is_file($rl)) $log = array_filter(array_map('intval', file($rl, FILE_IGNORE_NEW_LINES)), fn($t) => $t > $now - 3600);
if (count($log) >= MAX_HOUR) out(false, 'rate', 429);

$to = addrs($j['to'] ?? ''); $cc = addrs($j['cc'] ?? ''); $bcc = addrs($j['bcc'] ?? '');
if (!$to) out(false, 'no recipient', 400);
if (count($to) + count($cc) + count($bcc) > MAX_RCPT) out(false, 'too many recipients', 400);
$reply = addrs($j['reply_to'] ?? FROM);
$name  = (string)($j['name'] ?? '企業支援 総合相談窓口');
$subj  = (string)($j['subject'] ?? '');
$text  = str_replace(["\r\n", "\r"], "\n", (string)($j['body'] ?? ''));
$html  = (string)($j['html'] ?? '');
$atts  = is_array($j['attachments'] ?? null) ? $j['attachments'] : [];

$h = [];
$h[] = 'From: ' . enc($name) . ' <' . FROM . '>';
if ($cc)  $h[] = 'Cc: ' . implode(', ', $cc);
if ($bcc) $h[] = 'Bcc: ' . implode(', ', $bcc);
$h[] = 'Reply-To: ' . implode(', ', $reply ?: [FROM]);
$h[] = 'MIME-Version: 1.0';
$h[] = 'Message-ID: <' . bin2hex(random_bytes(12)) . '@bsd.osaka>';

$textPart = "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . b64(str_replace("\n", "\r\n", $text));
if ($html !== '') {
  $ba = 'alt_' . bin2hex(random_bytes(8));
  $bodyPart = "Content-Type: multipart/alternative; boundary=\"$ba\"\r\n\r\n"
    . "--$ba\r\n$textPart\r\n"
    . "--$ba\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . b64($html) . "\r\n"
    . "--$ba--";
} else {
  $bodyPart = $textPart;
}

if ($atts) {
  $bm = 'mix_' . bin2hex(random_bytes(8));
  $h[] = "Content-Type: multipart/mixed; boundary=\"$bm\"";
  $body = "--$bm\r\n$bodyPart\r\n";
  foreach ($atts as $a) {
    $data = base64_decode((string)($a['data'] ?? ''), true);
    if ($data === false) out(false, 'attachment', 400);
    $fn = one_line($a['name'] ?? 'file');
    $ty = preg_match('#^[\w.+-]+/[\w.+-]+$#', (string)($a['type'] ?? '')) ? $a['type'] : 'application/octet-stream';
    $fe = rawurlencode($fn);
    $body .= "--$bm\r\nContent-Type: $ty; name=\"" . enc($fn) . "\"\r\n"
      . "Content-Transfer-Encoding: base64\r\n"
      . "Content-Disposition: attachment; filename*=UTF-8''$fe\r\n\r\n" . b64($data) . "\r\n";
  }
  $body .= "--$bm--";
} else {
  // 本文の部分の見出しを、メール全体の見出しへ移す
  [$ph, $pb] = explode("\r\n\r\n", $bodyPart, 2);
  foreach (explode("\r\n", $ph) as $l) $h[] = $l;
  $body = $pb;
}

$ok = mail(implode(', ', $to), enc($subj), $body, implode("\r\n", $h), '-f' . FROM);
if (!$ok) out(false, 'send failed', 500);
$log[] = $now;
@file_put_contents($rl, implode("\n", $log) . "\n", LOCK_EX);
out(true);
