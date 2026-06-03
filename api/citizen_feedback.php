<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$db = getDB();

// Auto-create table if not exists
try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS citizen_feedback (
            id             INT AUTO_INCREMENT PRIMARY KEY,
            citizen_id     INT NOT NULL,
            category       VARCHAR(100) NOT NULL,
            rating         INT NOT NULL DEFAULT 5,
            message        TEXT NOT NULL,
            status         ENUM('unread', 'reviewed') DEFAULT 'unread',
            created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
} catch (Exception $e) {
    // Ignore if table exists or permission issue
}

if ($method === 'GET') {
    if ($user['role'] === 'admin') {
        $stmt = $db->query("
            SELECT f.*, c.name as citizen_name, c.mobile as citizen_mobile 
            FROM citizen_feedback f
            JOIN citizens c ON f.citizen_id = c.id
            ORDER BY f.created_at DESC
        ");
        jsonResponse($stmt->fetchAll());
    } else {
        $stmt = $db->prepare("SELECT * FROM citizen_feedback WHERE citizen_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user['id']]);
        jsonResponse($stmt->fetchAll());
    }
}

if ($method === 'POST') {
    if ($user['role'] !== 'citizen') {
        jsonError(403, 'Only citizens can submit feedback');
    }
    
    $data = getInput();
    if (empty($data['category']) || empty($data['message']) || !isset($data['rating'])) {
        jsonError(400, 'Category, rating, and message are required');
    }

    $stmt = $db->prepare("
        INSERT INTO citizen_feedback (citizen_id, category, rating, message, status, created_at)
        VALUES (?, ?, ?, ?, 'unread', NOW())
    ");
    
    $stmt->execute([
        $user['id'],
        $data['category'],
        intval($data['rating']),
        $data['message']
    ]);

    jsonResponse(['id' => $db->lastInsertId(), 'message' => 'Feedback submitted successfully'], 201);
}

if ($method === 'PUT') {
    requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'Feedback ID is required');

    $data = getInput();
    if (!isset($data['status'])) jsonError(400, 'Status is required');

    $stmt = $db->prepare("UPDATE citizen_feedback SET status = ? WHERE id = ?");
    $stmt->execute([$data['status'], $id]);

    jsonResponse(['message' => 'Feedback updated successfully']);
}
