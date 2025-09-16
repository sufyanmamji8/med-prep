<?php
// Simple CORS-enabled proxy for cPanel hosting
// Usage: /proxy.php?url=https%3A%2F%2Fexample.com%2Fimage.jpg

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: *');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$url = isset($_GET['url']) ? $_GET['url'] : '';
if (!$url) {
  http_response_code(400);
  echo 'Missing url parameter';
  exit;
}

// Basic validation to avoid SSRF to local addresses
if (preg_match('/^https?:\/\//i', $url) !== 1) {
  http_response_code(400);
  echo 'Invalid url';
  exit;
}

// Disallow access to RFC1918/private/internal ranges
$blocked = ['localhost', '127.0.0.1', '::1'];
$host = parse_url($url, PHP_URL_HOST);
if (in_array($host, $blocked, true)) {
  http_response_code(403);
  echo 'Forbidden host';
  exit;
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
$data = curl_exec($ch);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 400 || $data === false) {
  http_response_code(502);
  echo 'Upstream error';
  exit;
}

if ($contentType) {
  header('Content-Type: ' . $contentType);
}
echo $data;
?>



