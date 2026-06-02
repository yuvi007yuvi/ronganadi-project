<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$db = getDB();

if ($method === 'GET') {
    $stmt = $db->query("
        SELECT o.*, d.name as department_name 
        FROM grievance_officers o 
        LEFT JOIN grievance_departments d ON o.department_id = d.id 
        ORDER BY o.name ASC
    ");
    jsonResponse($stmt->fetchAll());
}

if ($method === 'POST') {
    requireAdmin();
    $data = getInput();
    if (empty($data['name']) || empty($data['department_id'])) {
        jsonError(400, 'Officer name and department ID are required');
    }
    
    try {
        $stmt = $db->prepare('INSERT INTO grievance_officers (name, department_id, designation, mobile, status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['name'],
            intval($data['department_id']),
            $data['designation'] ?? '',
            $data['mobile'] ?? '',
            $data['status'] ?? 'active'
        ]);
        jsonResponse(['id' => $db->lastInsertId(), 'message' => 'Officer created successfully'], 201);
    } catch (PDOException $e) {
        jsonError(500, 'Error: ' . $e->getMessage());
    }
}

if ($method === 'PUT') {
    requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'Officer ID is required');
    
    $data = getInput();
    if (empty($data['name']) || empty($data['department_id'])) {
        jsonError(400, 'Officer name and department ID are required');
    }
    
    try {
        $stmt = $db->prepare('UPDATE grievance_officers SET name = ?, department_id = ?, designation = ?, mobile = ?, status = ? WHERE id = ?');
        $stmt->execute([
            $data['name'],
            intval($data['department_id']),
            $data['designation'] ?? '',
            $data['mobile'] ?? '',
            $data['status'] ?? 'active',
            $id
        ]);
        jsonResponse(['message' => 'Officer updated successfully']);
    } catch (PDOException $e) {
        jsonError(500, 'Error: ' . $e->getMessage());
    }
}

if ($method === 'DELETE') {
    requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'Officer ID is required');
    
    try {
        $stmt = $db->prepare('DELETE FROM grievance_officers WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Officer deleted successfully']);
    } catch (PDOException $e) {
        jsonError(500, 'Error: ' . $e->getMessage());
    }
}

jsonError(405, 'Method not allowed');
