<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

if ($method === 'GET') {
    // Both admin and surveyor can view surveys. Admin sees all, surveyor sees active.
    $user = requireAuth();
    if ($user['role'] === 'admin') {
        $stmt = $db->query("SELECT id, title, description, fields_json, assigned_to, status, created_at, created_by FROM custom_surveys ORDER BY created_at DESC");
    } else {
        $stmt = $db->query("SELECT id, title, description, fields_json, assigned_to, status, created_at, created_by FROM custom_surveys WHERE status = 'active' ORDER BY created_at DESC");
    }
    
    $surveys = $stmt->fetchAll();
    // Decode JSON strings into PHP arrays so they get encoded nicely
    foreach ($surveys as &$s) {
        $s['fields_json'] = json_decode($s['fields_json'], true);
        $s['assigned_to'] = $s['assigned_to'] ? json_decode($s['assigned_to'], true) : [];
    }
    jsonResponse($surveys);
}

if ($method === 'POST') {
    $user = requireAdmin();
    $data = getInput();
    
    if (empty($data['title']) || empty($data['fields_json'])) {
        jsonError(400, 'Title and fields are required');
    }

    $assigned_to = isset($data['assigned_to']) ? $data['assigned_to'] : [];

    $stmt = $db->prepare('
        INSERT INTO custom_surveys (title, description, fields_json, assigned_to, status, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ');
    
    $stmt->execute([
        $data['title'],
        $data['description'] ?? '',
        json_encode($data['fields_json']),
        json_encode($assigned_to),
        $data['status'] ?? 'active',
        $user['id']
    ]);
    
    jsonResponse(['id' => $db->lastInsertId()], 201);
}

if ($method === 'PUT') {
    $user = requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'Survey ID required');
    
    $data = getInput();
    $updates = [];
    $params = [];
    
    if (isset($data['title'])) { $updates[] = "title = ?"; $params[] = $data['title']; }
    if (isset($data['description'])) { $updates[] = "description = ?"; $params[] = $data['description']; }
    if (isset($data['fields_json'])) { $updates[] = "fields_json = ?"; $params[] = json_encode($data['fields_json']); }
    if (isset($data['assigned_to'])) { $updates[] = "assigned_to = ?"; $params[] = json_encode($data['assigned_to']); }
    if (isset($data['status'])) { $updates[] = "status = ?"; $params[] = $data['status']; }
    
    if (empty($updates)) {
        jsonResponse(['message' => 'No updates provided']);
    }
    
    $params[] = $id;
    $db->prepare('UPDATE custom_surveys SET ' . implode(', ', $updates) . ' WHERE id = ?')->execute($params);
    jsonResponse(['message' => 'Survey updated']);
}

if ($method === 'DELETE') {
    $user = requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'Survey ID required');
    $db->prepare('DELETE FROM custom_surveys WHERE id = ?')->execute([$id]);
    jsonResponse(['message' => 'Survey deleted']);
}

jsonError(405, 'Method not allowed');
