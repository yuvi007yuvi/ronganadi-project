<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$db = getDB();

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM grievance_departments ORDER BY name ASC");
    jsonResponse($stmt->fetchAll());
}

if ($method === 'POST') {
    requireAdmin();
    $data = getInput();
    if (empty($data['name'])) jsonError(400, 'Department name is required');
    
    try {
        $stmt = $db->prepare('INSERT INTO grievance_departments (name, head_officer, status) VALUES (?, ?, ?)');
        $stmt->execute([
            $data['name'],
            $data['head_officer'] ?? '',
            $data['status'] ?? 'active'
        ]);
        jsonResponse(['id' => $db->lastInsertId(), 'message' => 'Department created successfully'], 201);
    } catch (PDOException $e) {
        jsonError(500, 'Error: ' . $e->getMessage());
    }
}

if ($method === 'PUT') {
    requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'Department ID is required');
    
    $data = getInput();
    if (empty($data['name'])) jsonError(400, 'Department name is required');
    
    try {
        $stmt = $db->prepare('UPDATE grievance_departments SET name = ?, head_officer = ?, status = ? WHERE id = ?');
        $stmt->execute([
            $data['name'],
            $data['head_officer'] ?? '',
            $data['status'] ?? 'active',
            $id
        ]);
        jsonResponse(['message' => 'Department updated successfully']);
    } catch (PDOException $e) {
        jsonError(500, 'Error: ' . $e->getMessage());
    }
}

if ($method === 'DELETE') {
    requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'Department ID is required');
    
    try {
        $stmt = $db->prepare('DELETE FROM grievance_departments WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Department deleted successfully']);
    } catch (PDOException $e) {
        jsonError(500, 'Error: ' . $e->getMessage());
    }
}

jsonError(405, 'Method not allowed');
