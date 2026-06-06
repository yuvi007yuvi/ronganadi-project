<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

if ($method === 'GET') {
    $stmt = $db->query("
        SELECT f.*, t.name as type_name, t.icon_type, t.custom_fields_schema 
        FROM gis_facilities f
        JOIN gis_facility_types t ON f.type_id = t.id
        ORDER BY f.created_at DESC
    ");
    
    $facilities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($facilities as &$fac) {
        if (!empty($fac['custom_fields_data'])) {
            $fac['custom_fields_data'] = json_decode($fac['custom_fields_data'], true);
        } else {
            $fac['custom_fields_data'] = [];
        }
        
        if (!empty($fac['custom_fields_schema'])) {
            $fac['custom_fields_schema'] = json_decode($fac['custom_fields_schema'], true);
        } else {
            $fac['custom_fields_schema'] = [];
        }
        
        $fac['latitude'] = (float)$fac['latitude'];
        $fac['longitude'] = (float)$fac['longitude'];
    }
    
    jsonResponse($facilities);
}

if ($method === 'POST') {
    requireAdmin();
    $data = getInput();
    
    if (empty($data['type_id']) || empty($data['name']) || empty($data['latitude']) || empty($data['longitude']) || empty($data['address']) || empty($data['ward_number'])) {
        jsonError(400, 'Required fixed fields missing');
    }

    try {
        $stmt = $db->prepare("
            INSERT INTO gis_facilities 
            (type_id, name, latitude, longitude, address, ward_number, zone_number, status, photo_url, custom_fields_data, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $customFieldsJson = isset($data['custom_fields_data']) ? json_encode($data['custom_fields_data']) : null;
        
        $photo_url = $data['photo_url'] ?? null;
        if ($photo_url && strpos($photo_url, 'data:image') === 0) {
            list($type, $icon_data) = explode(';', $photo_url);
            list(, $icon_data)      = explode(',', $icon_data);
            $decoded = base64_decode($icon_data);
            
            $ext = 'png';
            if (strpos($type, 'jpeg') !== false || strpos($type, 'jpg') !== false) $ext = 'jpg';
            else if (strpos($type, 'svg') !== false) $ext = 'svg';
            
            $upload_dir = __DIR__ . '/../public/uploads/facilities/';
            if (!is_dir($upload_dir)) @mkdir($upload_dir, 0777, true);
            
            $filename = 'photo_' . time() . '_' . uniqid() . '.' . $ext;
            file_put_contents($upload_dir . $filename, $decoded);
            $photo_url = '/uploads/facilities/' . $filename;
        }

        $stmt->execute([
            $data['type_id'],
            $data['name'],
            $data['latitude'],
            $data['longitude'],
            $data['address'],
            $data['ward_number'],
            $data['zone_number'] ?? null,
            $data['status'] ?? 'active',
            $photo_url,
            $customFieldsJson
        ]);
        
        jsonResponse(['id' => $db->lastInsertId(), 'message' => 'Facility added successfully'], 201);
    } catch (Exception $e) {
        jsonError(500, 'Failed to add facility: ' . $e->getMessage());
    }
}

if ($method === 'PUT') {
    requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'ID required');
    
    $data = getInput();
    
    try {
        $stmt = $db->prepare("
            UPDATE gis_facilities 
            SET type_id = ?, name = ?, latitude = ?, longitude = ?, address = ?, ward_number = ?, zone_number = ?, status = ?, photo_url = ?, custom_fields_data = ?
            WHERE id = ?
        ");
        
        $customFieldsJson = isset($data['custom_fields_data']) ? json_encode($data['custom_fields_data']) : null;
        
        $photo_url = $data['photo_url'] ?? null;
        if ($photo_url && strpos($photo_url, 'data:image') === 0) {
            list($type, $icon_data) = explode(';', $photo_url);
            list(, $icon_data)      = explode(',', $icon_data);
            $decoded = base64_decode($icon_data);
            
            $ext = 'png';
            if (strpos($type, 'jpeg') !== false || strpos($type, 'jpg') !== false) $ext = 'jpg';
            else if (strpos($type, 'svg') !== false) $ext = 'svg';
            
            $upload_dir = __DIR__ . '/../public/uploads/facilities/';
            if (!is_dir($upload_dir)) @mkdir($upload_dir, 0777, true);
            
            $filename = 'photo_' . time() . '_' . uniqid() . '.' . $ext;
            file_put_contents($upload_dir . $filename, $decoded);
            $photo_url = '/uploads/facilities/' . $filename;
        }

        $stmt->execute([
            $data['type_id'],
            $data['name'],
            $data['latitude'],
            $data['longitude'],
            $data['address'],
            $data['ward_number'],
            $data['zone_number'] ?? null,
            $data['status'] ?? 'active',
            $photo_url,
            $customFieldsJson,
            $id
        ]);
        
        jsonResponse(['message' => 'Facility updated successfully']);
    } catch (Exception $e) {
        jsonError(500, 'Failed to update facility: ' . $e->getMessage());
    }
}

if ($method === 'DELETE') {
    requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'ID required');
    
    try {
        $stmt = $db->prepare("DELETE FROM gis_facilities WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Facility deleted successfully']);
    } catch (Exception $e) {
        jsonError(500, 'Failed to delete facility');
    }
}

jsonError(405, 'Method not allowed');
