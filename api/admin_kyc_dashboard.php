<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Authenticate Admin
$user = authenticateUser();

if (!$user || $user['role'] !== 'admin') {
    jsonError(401, 'Unauthorized access. Admins only.');
}

if ($method === 'GET') {
    $db = getDB();

    try {
        // 1. Total Registered Citizens
        $stmtTotal = $db->query("SELECT COUNT(*) FROM citizens");
        $total_users = $stmtTotal->fetchColumn();

        // 2. Total KYC Completed
        $stmtCompleted = $db->query("SELECT COUNT(*) FROM citizens WHERE kyc_status = 'completed' AND role = 'citizen'");
        $kyc_completed = $stmtCompleted->fetchColumn();

        // 3. Total Data Available in citizen_reports
        $stmtReports = $db->query("SELECT COUNT(*) FROM citizen_reports");
        $total_reports = $stmtReports->fetchColumn();

        // 4. KYC Records List (Join citizens and citizen_reports)
        $sql = "
            SELECT 
                c.id as citizen_id,
                c.full_name,
                c.mobile,
                c.kyc_status,
                c.kyc_number,
                c.kyc_id_type,
                c.kyc_id_number,
                c.submitted_at as kyc_date,
                r.name as report_name,
                r.father_husband_name,
                r.guardian_name,
                r.village_address,
                r.caste,
                r.religion,
                r.family_above_18,
                r.family_below_18,
                r.booth_no_name,
                r.panchayat,
                r.police_station,
                r.district,
                r.pin_code,
                r.aadhaar_no,
                r.voter_id,
                r.pan,
                r.ration_card_no,
                r.disability_uid,
                r.bank_account_no,
                r.branch_name,
                r.ifsc,
                r.alternate_no,
                r.schemes_applied,
                r.schemes_included,
                r.help_done
            FROM citizens c
            LEFT JOIN citizen_reports r ON c.kyc_number = r.kyc_number
            WHERE c.role = 'citizen'
            ORDER BY c.updated_at DESC
        ";

        $stmtRecords = $db->query($sql);
        $records = $stmtRecords->fetchAll(PDO::FETCH_ASSOC);

        jsonResponse([
            'success' => true,
            'data' => [
                'total_users' => (int)$total_users,
                'kyc_completed' => (int)$kyc_completed,
                'total_reports' => (int)$total_reports,
                'records' => $records
            ]
        ]);

    } catch (PDOException $e) {
        jsonError(500, 'Database error: ' . $e->getMessage());
    }
}

jsonError(405, 'Method not allowed');
