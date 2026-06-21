<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

try {
    $db = getDB();
    
    // Check and Add kyc_status
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN kyc_status ENUM('pending', 'completed') DEFAULT 'pending'");
        echo "<p>Added kyc_status column.</p>";
    } catch (PDOException $e) {
        echo "<p>kyc_status column check: " . $e->getMessage() . "</p>";
    }

    // Check and Add kyc_id_type
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN kyc_id_type VARCHAR(50) NULL");
        echo "<p>Added kyc_id_type column.</p>";
    } catch (PDOException $e) {
        echo "<p>kyc_id_type column check: " . $e->getMessage() . "</p>";
    }

    // Check and Add kyc_id_number
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN kyc_id_number VARCHAR(100) NULL");
        echo "<p>Added kyc_id_number column.</p>";
    } catch (PDOException $e) {
        echo "<p>kyc_id_number column check: " . $e->getMessage() . "</p>";
    }

    // Check and Add booth_no_name
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN booth_no_name VARCHAR(255) NULL");
        echo "<p>Added booth_no_name column.</p>";
    } catch (PDOException $e) {
        echo "<p>booth_no_name column check: " . $e->getMessage() . "</p>";
    }

    // Check and Add police_station
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN police_station VARCHAR(255) NULL");
        echo "<p>Added police_station column.</p>";
    } catch (PDOException $e) {
        echo "<p>police_station column check: " . $e->getMessage() . "</p>";
    }

    // Check and Add district
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN district VARCHAR(255) NULL");
        echo "<p>Added district column.</p>";
    } catch (PDOException $e) {
        echo "<p>district column check: " . $e->getMessage() . "</p>";
    }

    // Check and Add pin_code
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN pin_code VARCHAR(20) NULL");
        echo "<p>Added pin_code column.</p>";
    } catch (PDOException $e) {
        echo "<p>pin_code column check: " . $e->getMessage() . "</p>";
    }

    // Check and Add kyc_number to citizens
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN kyc_number VARCHAR(100) NULL");
        echo "<p>Added kyc_number column to citizens.</p>";
    } catch (PDOException $e) {
        echo "<p>kyc_number column check (citizens): " . $e->getMessage() . "</p>";
    }

    // Check and Add kyc_number to citizen_reports
    try {
        $db->exec("ALTER TABLE citizen_reports ADD COLUMN kyc_number VARCHAR(100) NULL");
        echo "<p>Added kyc_number column to citizen_reports.</p>";
    } catch (PDOException $e) {
        echo "<p>kyc_number column check (citizen_reports): " . $e->getMessage() . "</p>";
    }

    echo "<h3>Citizen KYC Schema Update Completed</h3>";
} catch (Exception $e) {
    echo "<h3>Error: " . $e->getMessage() . "</h3>";
}
?>
