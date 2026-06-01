<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = getInput();
    $required = ['full_name', 'mobile', 'password', 'address', 'area'];
    foreach ($required as $f) {
        if (empty($data[$f])) jsonError(400, "Field '$f' is required");
    }

    $db = getDB();

    // Check duplicate mobile in citizens table
    $check = $db->prepare('SELECT id FROM citizens WHERE mobile = ?');
    $check->execute([$data['mobile']]);
    if ($check->fetch()) jsonError(409, 'Mobile number already registered');

    try {
        $is_migrated = isset($data['is_migrated']) && $data['is_migrated'] === 'yes' ? 'yes' : 'no';
        $stmt = $db->prepare('
            INSERT INTO citizens (full_name, mobile, password_hash, address, area, panchayat, is_migrated, submitted_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ');
        
        $stmt->execute([
            $data['full_name'], 
            $data['mobile'],
            password_hash($data['password'], PASSWORD_DEFAULT),
            $data['address'], 
            $data['area'],
            $data['panchayat'] ?? '',
            $is_migrated
        ]);
        
        $citizenId = $db->lastInsertId();
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Unknown column \'password_hash\'') !== false) {
            jsonError(500, 'Database error: The password_hash column is missing from the citizens table. Please run the SQL migration on Hostinger.');
        }
        jsonError(500, 'Database error: ' . $e->getMessage());
    }
    
    // Automatically generate a token so they can log in immediately
    $token = generateJWT([
        'id' => $citizenId,
        'name' => $data['full_name'],
        'mobile' => $data['mobile'],
        'role' => 'citizen',
        'area' => $data['area'],
        'panchayat' => $data['panchayat'] ?? '',
        'is_migrated' => $is_migrated,
    ]);

    jsonResponse([
        'message' => 'Signup successful',
        'token' => $token,
        'user' => [
            'id' => $citizenId,
            'name' => $data['full_name'],
            'mobile' => $data['mobile'],
            'role' => 'citizen',
            'area' => $data['area'],
            'panchayat' => $data['panchayat'] ?? '',
            'is_migrated' => $is_migrated,
        ]
    ], 201);
}

jsonError(405, 'Method not allowed');
