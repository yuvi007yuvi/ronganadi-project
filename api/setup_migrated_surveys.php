<?php
require_once 'config.php';

try {
    $pdo = getDB();
    
    // Create the migrated_surveys table
    $sql = "CREATE TABLE IF NOT EXISTS migrated_surveys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        village VARCHAR(100) NOT NULL,
        panchayat VARCHAR(100) NOT NULL,
        permanent_address TEXT NOT NULL,
        voter_id VARCHAR(50) NOT NULL,
        current_residence VARCHAR(100) NOT NULL,
        occupation VARCHAR(100) NOT NULL,
        monthly_salary DECIMAL(10,2) NOT NULL,
        in_hand_salary DECIMAL(10,2) NOT NULL,
        willing_to_return VARCHAR(20) NOT NULL,
        surveyor_name VARCHAR(100) DEFAULT NULL,
        remarks TEXT DEFAULT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($sql);
    echo "Successfully created migrated_surveys table.\n";
} catch (PDOException $e) {
    die("Error creating table: " . $e->getMessage() . "\n");
}
?>
