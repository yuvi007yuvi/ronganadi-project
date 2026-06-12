<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

if ($method === 'GET') {
    $isAdmin = false;
    $auth = $_SERVER['HTTP_X_AUTHORIZATION'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$auth && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    if (!$auth && function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $auth = $requestHeaders['X-Authorization'] ?? $requestHeaders['Authorization'] ?? $requestHeaders['authorization'] ?? '';
    }
    if ($auth && preg_match('/Bearer\s+(.+)/', $auth, $m)) {
        $payload = verifyJWT($m[1]);
        if ($payload && isset($payload['role']) && $payload['role'] === 'admin') {
            $isAdmin = true;
        }
    }

    $where = $isAdmin ? '' : 'WHERE published = 1';
    $stmt = $db->query("SELECT * FROM announcements $where ORDER BY created_at DESC");
    jsonResponse($stmt->fetchAll());
}

$user = requireAdmin();

if ($method === 'POST') {
    $data = getInput();
    if (empty($data['title']) || empty($data['content'])) jsonError(400, 'Title and content required');
    $stmt = $db->prepare('
        INSERT INTO announcements (title, content, type, priority, published, published_at, expires_at, created_by)
        VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?)
    ');
    $stmt->execute([
        $data['title'], $data['content'],
        $data['type'] ?? 'announcement',
        $data['priority'] ?? 'medium',
        $data['published'] ? 1 : 0,
        $data['expiresAt'] ?: null,
        $user['id'],
    ]);
    jsonResponse(['id' => $db->lastInsertId()], 201);
}

if ($method === 'PUT') {
    $id = intval($_GET['id'] ?? 0);
    $data = getInput();
    if (isset($data['published'])) {
        $db->prepare('UPDATE announcements SET published = ? WHERE id = ?')->execute([$data['published'] ? 1 : 0, $id]);
        jsonResponse(['message' => 'Updated']);
    }
    $db->prepare('UPDATE announcements SET title=?, content=?, type=?, priority=?, published=?, expires_at=? WHERE id=?')
       ->execute([$data['title'], $data['content'], $data['type'], $data['priority'], $data['published'] ? 1 : 0, $data['expiresAt'] ?: null, $id]);
    jsonResponse(['message' => 'Announcement updated']);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    $db->prepare('DELETE FROM announcements WHERE id = ?')->execute([$id]);
    jsonResponse(['message' => 'Deleted']);
}

jsonError(405, 'Method not allowed');
