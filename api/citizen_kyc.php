<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Authenticate request
$user = authenticateUser();

if (!$user || $user['role'] !== 'citizen') {
    jsonError(401, 'Unauthorized access');
}

if ($method === 'POST') {
    $input = getInput();
    $id_type = trim($input['id_type'] ?? '');
    $id_number = trim($input['id_number'] ?? '');

    if (empty($id_type) || empty($id_number)) {
        jsonError(400, 'ID Type and ID Number are required');
    }

    $column_map = [
        'Voter ID' => 'voter_id',
        'Aadhaar No.' => 'aadhaar_no',
        'PAN' => 'pan',
        'Ration Card No' => 'ration_card_no'
    ];

    if (!array_key_exists($id_type, $column_map)) {
        jsonError(400, 'Invalid ID Type selected');
    }

    $search_column = $column_map[$id_type];
    $db = getDB();

    try {
        // Find matching record in citizen_reports
        $stmt = $db->prepare("SELECT * FROM citizen_reports WHERE {$search_column} = ? LIMIT 1");
        $stmt->execute([$id_number]);
        $report = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$report) {
            jsonError(404, 'No records found for the provided ID. Please check the details and try again.');
        }

        // Generate unique KYC number
        $kyc_number = 'KYC-' . strtoupper(substr(uniqid(), -6)) . rand(10, 99);

        // Update citizen_reports table
        $updateReportStmt = $db->prepare("UPDATE citizen_reports SET kyc_number = ? WHERE id = ?");
        $updateReportStmt->execute([$kyc_number, $report['id']]);

        // Update citizens table
        $updateStmt = $db->prepare("
            UPDATE citizens 
            SET kyc_status = 'completed', 
                kyc_id_type = ?, 
                kyc_id_number = ?, 
                booth_no_name = ?, 
                panchayat = ?, 
                police_station = ?, 
                district = ?, 
                pin_code = ?,
                kyc_number = ?
            WHERE id = ?
        ");
        $updateStmt->execute([
            $id_type,
            $id_number,
            $report['booth_no_name'] ?? null,
            $report['panchayat'] ?? null,
            $report['police_station'] ?? null,
            $report['district'] ?? null,
            $report['pin_code'] ?? null,
            $kyc_number,
            $user['id']
        ]);

        // Re-fetch updated user to generate new token
        $userStmt = $db->prepare("SELECT * FROM citizens WHERE id = ? LIMIT 1");
        $userStmt->execute([$user['id']]);
        $updatedUser = $userStmt->fetch(PDO::FETCH_ASSOC);

        $token = generateJWT([
            'id' => $updatedUser['id'],
            'name' => $updatedUser['full_name'],
            'mobile' => $updatedUser['mobile'],
            'role' => 'citizen',
            'area' => $updatedUser['area'],
            'kyc_status' => $updatedUser['kyc_status'] ?? 'pending',
            'kyc_number' => $updatedUser['kyc_number'] ?? null,
            'panchayat' => $updatedUser['panchayat'] ?? '',
            'booth_no_name' => $updatedUser['booth_no_name'] ?? '',
            'police_station' => $updatedUser['police_station'] ?? '',
            'district' => $updatedUser['district'] ?? '',
            'pin_code' => $updatedUser['pin_code'] ?? '',
        ]);

        jsonResponse([
            'message' => 'KYC completed successfully',
            'token' => $token,
            'user' => [
                'id' => $updatedUser['id'],
                'name' => $updatedUser['full_name'],
                'mobile' => $updatedUser['mobile'],
                'role' => 'citizen',
                'area' => $updatedUser['area'],
                'kyc_status' => $updatedUser['kyc_status'] ?? 'pending',
                'kyc_number' => $updatedUser['kyc_number'] ?? null,
                'panchayat' => $updatedUser['panchayat'] ?? '',
                'booth_no_name' => $updatedUser['booth_no_name'] ?? '',
                'police_station' => $updatedUser['police_station'] ?? '',
                'district' => $updatedUser['district'] ?? '',
                'pin_code' => $updatedUser['pin_code'] ?? '',
            ]
        ]);

    } catch (PDOException $e) {
        jsonError(500, 'Database error: ' . $e->getMessage());
    }
}

jsonError(405, 'Method not allowed');
