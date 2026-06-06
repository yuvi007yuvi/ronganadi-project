<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM gis_facility_types ORDER BY name ASC");
    $types = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($types as &$type) {
        if (!empty($type['custom_fields_schema'])) {
            $type['custom_fields_schema'] = json_decode($type['custom_fields_schema'], true);
        } else {
            $type['custom_fields_schema'] = [];
        }
    }
    
    jsonResponse($types);
}

if ($method === 'POST') {
    requireAdmin();
    $data = getInput();
    
    if (empty($data['name'])) {
        jsonError(400, 'Facility type name is required');
    }

    try {
        $stmt = $db->prepare("
            INSERT INTO gis_facility_types 
            (name, icon_type, icon_url, custom_fields_schema, status, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        
        $schemaJson = isset($data['custom_fields_schema']) ? json_encode($data['custom_fields_schema']) : json_encode([]);
        $icon_url = $data['icon_url'] ?? null;
        if ($icon_url && strpos($icon_url, 'data:image') === 0) {
            list($type, $icon_data) = explode(';', $icon_url);
            list(, $icon_data)      = explode(',', $icon_data);
            $decoded = base64_decode($icon_data);
            
            $ext = 'png';
            if (strpos($type, 'jpeg') !== false || strpos($type, 'jpg') !== false) $ext = 'jpg';
            else if (strpos($type, 'svg') !== false) $ext = 'svg';
            
            $upload_dir = __DIR__ . '/../public/uploads/icons/';
            if (!is_dir($upload_dir)) @mkdir($upload_dir, 0777, true);
            
            $filename = 'icon_' . time() . '_' . uniqid() . '.' . $ext;
            file_put_contents($upload_dir . $filename, $decoded);
            $icon_url = '/uploads/icons/' . $filename;
        }

        $stmt->execute([
            $data['name'],
            $data['icon_type'] ?? 'default',
            $icon_url,
            $schemaJson,
            $data['status'] ?? 'active'
        ]);
        
        jsonResponse(['id' => $db->lastInsertId(), 'message' => 'Facility type created successfully'], 201);
    } catch (Exception $e) {
        jsonError(500, 'Failed to create facility type: ' . $e->getMessage());
    }
}

if ($method === 'PUT') {
    requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'ID required');
    
    $data = getInput();
    
    try {
        $stmt = $db->prepare("
            UPDATE gis_facility_types 
            SET name = ?, icon_type = ?, icon_url = ?, custom_fields_schema = ?, status = ?
            WHERE id = ?
        ");
        
        $schemaJson = isset($data['custom_fields_schema']) ? json_encode($data['custom_fields_schema']) : json_encode([]);
        $icon_url = $data['icon_url'] ?? null;
        if ($icon_url && strpos($icon_url, 'data:image') === 0) {
            list($type, $icon_data) = explode(';', $icon_url);
            list(, $icon_data)      = explode(',', $icon_data);
            $decoded = base64_decode($icon_data);
            
            $ext = 'png';
            if (strpos($type, 'jpeg') !== false || strpos($type, 'jpg') !== false) $ext = 'jpg';
            else if (strpos($type, 'svg') !== false) $ext = 'svg';
            
            $upload_dir = __DIR__ . '/../public/uploads/icons/';
            if (!is_dir($upload_dir)) @mkdir($upload_dir, 0777, true);
            
            $filename = 'icon_' . time() . '_' . uniqid() . '.' . $ext;
            file_put_contents($upload_dir . $filename, $decoded);
            $icon_url = '/uploads/icons/' . $filename;
        }

        $stmt->execute([
            $data['name'],
            $data['icon_type'] ?? 'default',
            $icon_url,
            $schemaJson,
            $data['status'] ?? 'active',
            $id
        ]);
        
        jsonResponse(['message' => 'Facility type updated successfully']);
    } catch (Exception $e) {
        jsonError(500, 'Failed to update facility type: ' . $e->getMessage());
    }
}

if ($method === 'DELETE') {
    requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'ID required');
    
    $stmt = $db->prepare("SELECT COUNT(*) FROM gis_facilities WHERE type_id = ?");
    $stmt->execute([$id]);
    if ($stmt->fetchColumn() > 0) {
        jsonError(400, 'Cannot delete this type because there are facilities assigned to it.');
    }
    
    try {
        $stmt = $db->prepare("DELETE FROM gis_facility_types WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Facility type deleted successfully']);
    } catch (Exception $e) {
        jsonError(500, 'Failed to delete facility type');
    }
}

jsonError(405, 'Method not allowed');
