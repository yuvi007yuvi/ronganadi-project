<?php
// ─────────────────────────────────────────────────────────────
//  Ronganadi Beta – PHP Backend API (Hostinger / cPanel)
//  File: api/config.php
//  Configure these values in your Hostinger MySQL database
// ─────────────────────────────────────────────────────────────

if (isset($_SERVER['HTTP_HOST']) && ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1' || strpos($_SERVER['HTTP_HOST'], '192.168.') === 0) || php_sapi_name() === 'cli') {
    define('DB_HOST', 'localhost');      
    define('DB_NAME', 'u114302256_ronganadibeta');   
    define('DB_USER', 'root');   
    define('DB_PASS', 'admin');
} else {
    define('DB_HOST', 'localhost');      
    define('DB_NAME', 'u114302256_ronganadibeta');   
    define('DB_USER', 'u114302256_admin');   
    define('DB_PASS', 'Admin@786970');
}

define('JWT_SECRET', 'change-this-to-a-strong-random-secret-key-2024');
define('JWT_EXPIRE', 86400); // 24 hours

// CORS – update with your actual domain on Hostinger
define('ALLOWED_ORIGIN', '*'); // In production: 'https://yourdomain.com'

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER, DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            jsonError(500, 'Database connection failed');
        }
    }
    return $pdo;
}

function setCorsHeaders() {
    $allowed_origins = ['https://ranganadibeta.com', 'http://localhost:5173'];
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    if (in_array($origin, $allowed_origins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        header('Access-Control-Allow-Origin: https://ranganadibeta.com');
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Authorization, x-authorization');
    header('Content-Type: application/json; charset=UTF-8');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => true, 'data' => $data]);
    exit();
}

function jsonError($code, $message) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit();
}

function getInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

// ─── Simple JWT ───
function generateJWT($payload) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['exp'] = time() + JWT_EXPIRE;
    $payload = base64_encode(json_encode($payload));
    $sig = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$sig";
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $payload, $sig] = $parts;
    $expected = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $data = json_decode(base64_decode($payload), true);
    if ($data['exp'] < time()) return null;
    return $data;
}

function requireAuth() {
    // Check multiple possible locations, prioritizing the custom X-Authorization header
    $auth = $_SERVER['HTTP_X_AUTHORIZATION'] ?? '';
    
    if (!$auth) {
        $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    }
    if (!$auth && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (!$auth && function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $auth = $requestHeaders['X-Authorization'] ?? $requestHeaders['Authorization'] ?? $requestHeaders['authorization'] ?? '';
    }

    if (!preg_match('/Bearer\s+(.+)/', $auth, $m)) {
        jsonError(401, 'No token provided (Auth header missing)');
    }
    $payload = verifyJWT($m[1]);
    if (!$payload) jsonError(401, 'Invalid or expired token');
    return $payload;
}

function requireAdmin() {
    $user = requireAuth();
    if ($user['role'] !== 'admin') jsonError(403, 'Admin access required');
    return $user;
}
