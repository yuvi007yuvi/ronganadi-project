<?php
require_once __DIR__ . '/config.php';

setCorsHeaders();

try {
    $db = getDB();

    $sql = "CREATE TABLE IF NOT EXISTS citizen_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timestamp DATETIME,
        name VARCHAR(255),
        father_husband_name VARCHAR(255),
        guardian_name VARCHAR(255),
        village_address TEXT,
        caste VARCHAR(100),
        religion VARCHAR(100),
        family_above_18 INT,
        family_below_18 INT,
        booth_no_name VARCHAR(255),
        panchayat VARCHAR(255),
        police_station VARCHAR(255),
        district VARCHAR(255),
        pin_code VARCHAR(20),
        aadhaar_no VARCHAR(50),
        voter_id VARCHAR(50),
        pan VARCHAR(50),
        ration_card_no VARCHAR(100),
        disability_uid VARCHAR(100),
        bank_account_no VARCHAR(100),
        branch_name VARCHAR(255),
        ifsc VARCHAR(50),
        mobile_no VARCHAR(20),
        alternate_no VARCHAR(20),
        schemes_applied TEXT,
        schemes_included TEXT,
        help_done TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $db->exec($sql);
    
    jsonResponse(["message" => "Table 'citizen_reports' created or already exists"]);
} catch (PDOException $e) {
    jsonError(500, "Database error: " . $e->getMessage());
}
