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
        
        $id_type = trim($data['id_type'] ?? '');
        $id_number = trim($data['id_number'] ?? '');
        
        $kyc_status = 'pending';
        $kyc_number = null;
        $booth_no_name = null;
        $panchayat_from_report = null;
        $police_station = null;
        $district = null;
        $pin_code = null;

        // Attempt KYC Verification if ID details are provided
        if (!empty($id_type) && !empty($id_number)) {
            $column_map = [
                'Voter ID' => 'voter_id',
                'Aadhaar No.' => 'aadhaar_no',
                'PAN' => 'pan',
                'Ration Card No' => 'ration_card_no'
            ];
            
            if (array_key_exists($id_type, $column_map)) {
                $search_column = $column_map[$id_type];
                $stmtReport = $db->prepare("SELECT * FROM citizen_reports WHERE {$search_column} = ? LIMIT 1");
                $stmtReport->execute([$id_number]);
                $report = $stmtReport->fetch(PDO::FETCH_ASSOC);
                
                if ($report) {
                    $kyc_status = 'completed';
                    $kyc_number = 'KYC-' . strtoupper(substr(uniqid(), -6)) . rand(10, 99);
                    $booth_no_name = $report['booth_no_name'] ?? null;
                    $panchayat_from_report = $report['panchayat'] ?? null;
                    $police_station = $report['police_station'] ?? null;
                    $district = $report['district'] ?? null;
                    $pin_code = $report['pin_code'] ?? null;
                    
                    // Update the report with the new KYC number
                    $updateReportStmt = $db->prepare("UPDATE citizen_reports SET kyc_number = ? WHERE id = ?");
                    $updateReportStmt->execute([$kyc_number, $report['id']]);
                }
            }
        }

        $final_panchayat = $panchayat_from_report ?: ($data['panchayat'] ?? '');

        $stmt = $db->prepare('
            INSERT INTO citizens (full_name, mobile, password_hash, address, area, panchayat, is_migrated, kyc_status, kyc_id_type, kyc_id_number, kyc_number, booth_no_name, police_station, district, pin_code, submitted_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ');
        
        $stmt->execute([
            $data['full_name'], 
            $data['mobile'],
            password_hash($data['password'], PASSWORD_DEFAULT),
            $data['address'], 
            $data['area'],
            $final_panchayat,
            $is_migrated,
            $kyc_status,
            $kyc_status === 'completed' ? $id_type : null,
            $kyc_status === 'completed' ? $id_number : null,
            $kyc_number,
            $booth_no_name,
            $police_station,
            $district,
            $pin_code
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
        'panchayat' => $final_panchayat,
        'is_migrated' => $is_migrated,
        'kyc_status' => $kyc_status,
        'kyc_number' => $kyc_number,
        'booth_no_name' => $booth_no_name,
        'police_station' => $police_station,
        'district' => $district,
        'pin_code' => $pin_code
    ]);

    jsonResponse([
        'message' => 'Signup successful',
        'kyc_verified' => $kyc_status === 'completed',
        'token' => $token,
        'user' => [
            'id' => $citizenId,
            'name' => $data['full_name'],
            'mobile' => $data['mobile'],
            'role' => 'citizen',
            'area' => $data['area'],
            'panchayat' => $final_panchayat,
            'is_migrated' => $is_migrated,
            'kyc_status' => $kyc_status,
            'kyc_number' => $kyc_number,
            'booth_no_name' => $booth_no_name,
            'police_station' => $police_station,
            'district' => $district,
            'pin_code' => $pin_code
        ]
    ], 201);
}

jsonError(405, 'Method not allowed');
