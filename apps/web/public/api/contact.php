<?php
/**
 * Endpoint de contacto del Portfolio jnicob.dev (hosting compartido, PHP >= 8.1).
 *
 * Patrón idéntico al de hotel_mc/php/contact.php, adaptado al esquema del
 * formulario del portfolio (subject, email, phone?, message, honeypot).
 *
 * Configuración por VARIABLES DE ENTORNO del hosting (sin credenciales en repo):
 *   CONTACT_TO       destinatario (obligatoria en producción)
 *   CONTACT_FROM     remitente del sobre (default no-reply@jnicob.dev)
 *   ALLOWED_ORIGIN   origen CORS permitido (default https://jnicob.dev)
 *   MAIL_TRANSPORT   mail | smtp | log   (default mail; log = solo desarrollo)
 *   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_EHLO_HOST
 *   RATE_MAX / RATE_WINDOW   rate-limit por IP (default 5 / 3600s)
 *   MIN_SECONDS      tiempo mínimo de rellenado (default 3)
 */

declare(strict_types=1);

// ---------- Config ----------
if (file_exists(__DIR__ . '/.env.php.local')) {
    $localEnv = include __DIR__ . '/.env.php.local';
    if (is_array($localEnv)) {
        foreach ($localEnv as $k => $v) {
            putenv("{$k}={$v}");
            $_ENV[$k] = (string)$v;
            $_SERVER[$k] = (string)$v;
        }
    }
}

/** getenv con default que respeta valores "0". */
function env(string $key, string $default): string
{
    $value = getenv($key);
    return ($value === false || $value === '') ? $default : $value;
}

$config = [
    'to'          => env('CONTACT_TO', 'j.nico.b@gmail.com'),
    'from'        => env('CONTACT_FROM', 'no-reply@jnicob.dev'),
    'ehlo_host'   => env('SMTP_EHLO_HOST', 'jnicob.dev'),
    'origin'      => env('ALLOWED_ORIGIN', 'https://jnicob.dev'),
    'transport'   => env('MAIL_TRANSPORT', 'mail'),
    'smtp_host'   => env('SMTP_HOST', ''),
    'smtp_port'   => (int) env('SMTP_PORT', '587'),
    'smtp_user'   => env('SMTP_USER', ''),
    'smtp_pass'   => env('SMTP_PASS', ''),
    'rate_max'    => (int) env('RATE_MAX', '5'),
    'rate_window' => (int) env('RATE_WINDOW', '3600'),
    'min_seconds' => (int) env('MIN_SECONDS', '3'),
    'state_dir'   => env('CONTACT_STATE_DIR', sys_get_temp_dir()),
];

// Límites de campo (espejo de contactSchema en schemas.ts)
const FIELD_LIMITS = [
    'subject' => ['min' => 3,  'max' => 200],
    'email'   => ['min' => 3,  'max' => 200],
    'phone'   => ['min' => 0,  'max' => 30],   // opcional
    'message' => ['min' => 10, 'max' => 2000],
];
const PHONE_PATTERN    = '/^[0-9+().\-\s]+$/';
const MIN_PHONE_DIGITS = 6;
const ALLOWED_FIELDS   = ['subject', 'email', 'phone', 'message', 'honeypot', 'ts'];
const MAX_BODY_BYTES   = 10240;

// ---------- Cabeceras ----------
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($config['origin'] !== '' && $origin === $config['origin']) {
    header('Access-Control-Allow-Origin: ' . $config['origin']);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST, OPTIONS');
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

if (!str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
    respond(415, ['ok' => false, 'error' => 'unsupported_media_type']);
}

// ---------- Cuerpo ----------
$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
    respond(413, ['ok' => false, 'error' => 'payload_too_large']);
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    respond(400, ['ok' => false, 'error' => 'invalid_json']);
}

// Allowlist estricta
$unknown = array_diff(array_keys($data), ALLOWED_FIELDS);
if ($unknown !== []) {
    respond(400, ['ok' => false, 'error' => 'validation', 'fields' => array_values($unknown)]);
}

// ---------- Anti-spam silencioso (responde ok sin enviar) ----------
$honeypot = trim((string) ($data['honeypot'] ?? ''));
$ts       = is_numeric($data['ts'] ?? null) ? (float) $data['ts'] : 0.0;
$elapsedS = (microtime(true) * 1000 - $ts) / 1000;
if ($honeypot !== '' || $ts <= 0 || $elapsedS < $config['min_seconds']) {
    respond(200, ['ok' => true]);
}

// ---------- Validación (espejo de contactSchema) ----------
function str_len(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
}

$errors = [];
$fields = [];
foreach (FIELD_LIMITS as $field => $limits) {
    $value = trim((string) ($data[$field] ?? ''));
    $len   = str_len($value);
    $required = in_array($field, ['subject', 'email', 'message'], true);
    if ($required && $len < $limits['min']) {
        $errors[] = $field;
    } elseif ($len > $limits['max']) {
        $errors[] = $field;
    }
    $fields[$field] = $value;
}
if ($fields['email'] !== '' && filter_var($fields['email'], FILTER_VALIDATE_EMAIL) === false) {
    $errors[] = 'email';
}
// Teléfono opcional: si se ingresó, validar formato y mínimo de dígitos
if ($fields['phone'] !== '') {
    if (
        preg_match(PHONE_PATTERN, $fields['phone']) !== 1
        || preg_match_all('/\d/', $fields['phone']) < MIN_PHONE_DIGITS
    ) {
        $errors[] = 'phone';
    }
}
if ($errors !== []) {
    respond(400, ['ok' => false, 'error' => 'validation', 'fields' => array_values(array_unique($errors))]);
}

// ---------- Rate limit por IP (ventana deslizante, flock, fail-closed) ----------
$ip   = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$file = $config['state_dir'] . '/portfolio-rl-' . sha1($ip) . '.json';
$now  = time();
if (is_link($file)) {
    respond(503, ['ok' => false, 'error' => 'unavailable']);
}
$fh = fopen($file, 'c+');
if ($fh === false || !flock($fh, LOCK_EX)) {
    respond(503, ['ok' => false, 'error' => 'unavailable']);
}
$timestamps = json_decode((string) stream_get_contents($fh), true);
$timestamps = is_array($timestamps) ? $timestamps : [];
$timestamps = array_values(array_filter($timestamps, fn ($t) => $t > $now - $config['rate_window']));
if (count($timestamps) >= $config['rate_max']) {
    flock($fh, LOCK_UN);
    fclose($fh);
    respond(429, ['ok' => false, 'error' => 'rate_limited']);
}
$timestamps[] = $now;
ftruncate($fh, 0);
rewind($fh);
fwrite($fh, json_encode($timestamps));
flock($fh, LOCK_UN);
fclose($fh);

// ---------- Composición del mensaje (texto plano, sin HTML de usuario) ----------
$stripHeader = fn (string $v): string => str_replace(["\r", "\n"], '', $v);

$subject = '=?UTF-8?B?' . base64_encode($stripHeader('[Portfolio] ' . $fields['subject'])) . '?=';
$body = "Nuevo mensaje de contacto desde jnicob.dev\n\n"
    . 'Asunto:    ' . $fields['subject'] . "\n"
    . 'Email:     ' . $fields['email'] . "\n"
    . 'Telefono:  ' . ($fields['phone'] ?: '-') . "\n\n"
    . "Mensaje:\n" . $fields['message'] . "\n";

$fromSafe    = $stripHeader($config['from']);
$replyToSafe = $stripHeader($fields['email']);

// ---------- Transportes ----------
function smtp_send(array $cfg, string $to, string $from, string $replyTo, string $subject, string $body): bool
{
    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer'       => true,
            'verify_peer_name'  => true,
            'peer_name'         => $cfg['smtp_host'],
            'SNI_enabled'       => true,
        ],
    ]);
    $sock = @stream_socket_client(
        "tcp://{$cfg['smtp_host']}:{$cfg['smtp_port']}",
        $errno,
        $errstr,
        10,
        STREAM_CLIENT_CONNECT,
        $ctx,
    );
    if ($sock === false) {
        return false;
    }
    stream_set_timeout($sock, 10);
    $expect = function (string $codePrefix) use ($sock): bool {
        do {
            $line = fgets($sock, 512);
            if ($line === false) {
                return false;
            }
        } while (isset($line[3]) && $line[3] === '-');
        return str_starts_with($line, $codePrefix);
    };
    $send = fn (string $cmd) => fwrite($sock, $cmd . "\r\n");

    $host = $cfg['ehlo_host'];
    if (!$expect('220')) return false;
    $send("EHLO $host");
    if (!$expect('250')) return false;
    $send('STARTTLS');
    if (!$expect('220')) return false;
    $tls = STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
    if (!stream_socket_enable_crypto($sock, true, $tls)) return false;
    $send("EHLO $host");
    if (!$expect('250')) return false;
    if ($cfg['smtp_user'] !== '') {
        $send('AUTH LOGIN');
        if (!$expect('334')) return false;
        $send(base64_encode($cfg['smtp_user']));
        if (!$expect('334')) return false;
        $send(base64_encode($cfg['smtp_pass']));
        if (!$expect('235')) return false;
    }
    $send("MAIL FROM:<$from>");
    if (!$expect('250')) return false;
    $send("RCPT TO:<$to>");
    if (!$expect('250')) return false;
    $send('DATA');
    if (!$expect('354')) return false;
    $headers = "From: $from\r\nReply-To: $replyTo\r\nSubject: $subject\r\n"
        . "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\n";
    $safeBody = preg_replace('/^\./m', '..', $body);
    $send($headers . "\r\n" . $safeBody . "\r\n.");
    if (!$expect('250')) return false;
    $send('QUIT');
    fclose($sock);
    return true;
}

// Transporte log = SOLO desarrollo
$writeLog = function (string $subject, string $body) use ($config): bool {
    $path = $config['state_dir'] . '/portfolio-contact.log';
    if (is_link($path)) {
        return false;
    }
    if (!file_exists($path)) {
        if (@touch($path) === false) {
            return false;
        }
        @chmod($path, 0600);
    }
    return (bool) file_put_contents(
        $path,
        json_encode(['t' => date('c'), 'subject' => $subject, 'body' => $body], JSON_UNESCAPED_UNICODE) . "\n",
        FILE_APPEND | LOCK_EX,
    );
};

$sent = match ($config['transport']) {
    'log' => $writeLog($subject, $body),
    'smtp' => smtp_send($config, $config['to'], $fromSafe, $replyToSafe, $subject, $body),
    default => mail(
        $config['to'],
        $subject,
        $body,
        "From: $fromSafe\r\nReply-To: $replyToSafe\r\nContent-Type: text/plain; charset=utf-8",
    ),
};

if (!$sent) {
    respond(500, ['ok' => false, 'error' => 'send_failed']);
}

respond(200, ['ok' => true]);
