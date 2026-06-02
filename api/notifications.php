<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$db = getDB();

if ($method === 'GET') {
    // Only citizen needs notifications
    if ($user['role'] !== 'citizen') {
        jsonResponse([]);
    }

    $stmt = $db->prepare("SELECT * FROM grievance_notifications WHERE citizen_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user['id']]);
    jsonResponse($stmt->fetchAll());
}

if ($method === 'PUT') {
    if ($user['role'] !== 'citizen') {
        jsonError(403, 'Unauthorized');
    }

    $id = intval($_GET['id'] ?? 0);
    $data = getInput();

    try {
        if ($id > 0) {
            $stmt = $db->prepare("UPDATE grievance_notifications SET is_read = 1 WHERE id = ? AND citizen_id = ?");
            $stmt->execute([$id, $user['id']]);
        } else {
            // Mark all as read
            $stmt = $db->prepare("UPDATE grievance_notifications SET is_read = 1 WHERE citizen_id = ?");
            $stmt->execute([$user['id']]);
        }
        jsonResponse(['message' => 'Notifications updated successfully']);
    } catch (PDOException $e) {
        jsonError(500, 'Error: ' . $e->getMessage());
    }
}

jsonError(405, 'Method not allowed');
