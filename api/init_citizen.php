<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$db = getDB();

try {
    $db->beginTransaction();

    // 1. Check/Add password_hash column
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN password_hash VARCHAR(255) NULL AFTER mobile");
        echo "<p>Added password_hash column to citizens table.</p>";
    } catch (PDOException $e) {
        echo "<p>password_hash column check: " . $e->getMessage() . " (probably already exists)</p>";
    }

    // 2. Check/Add panchayat column
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN panchayat VARCHAR(100) DEFAULT '' AFTER area");
        echo "<p>Added panchayat column to citizens table.</p>";
    } catch (PDOException $e) {
        echo "<p>panchayat column check: " . $e->getMessage() . " (probably already exists)</p>";
    }

    // 3. Check/Add is_migrated column
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN is_migrated ENUM('yes', 'no') DEFAULT 'no' AFTER panchayat");
        echo "<p>Added is_migrated column to citizens table.</p>";
    } catch (PDOException $e) {
        echo "<p>is_migrated column check: " . $e->getMessage() . " (probably already exists)</p>";
    }

    // 4. Check/Add status column
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active' AFTER is_migrated");
        echo "<p>Added status column to citizens table.</p>";
    } catch (PDOException $e) {
        echo "<p>status column check: " . $e->getMessage() . " (probably already exists)</p>";
    }

    // 5. Delete existing user with mobile '9999999999'
    $stmt = $db->prepare("DELETE FROM citizens WHERE mobile = ?");
    $stmt->execute(['9999999999']);
    echo "<p>Cleaned up existing citizen with mobile '9999999999'.</p>";

    // 6. Create default citizen user
    $hash = password_hash('citizen123', PASSWORD_DEFAULT);
    $insert = $db->prepare("
        INSERT INTO citizens (full_name, mobile, password_hash, address, area, panchayat, is_migrated, status, submitted_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    ");
    $insert->execute([
        'Citizen Test User',
        '9999999999',
        $hash,
        'Central Colony, Ward 01',
        'Ward 01',
        'Ronganadi Panchayat',
        'no'
    ]);
    
    $db->commit();

    echo "<h2>SUCCESS!</h2>";
    echo "<p>Citizen account has been initialized/seeded successfully.</p>";
    echo "<p><strong>Mobile Number:</strong> 9999999999</p>";
    echo "<p><strong>Password:</strong> citizen123</p>";
    echo "<p>Try logging in on the UI now.</p>";

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "<h2>ERROR!</h2>";
    echo "<p>Failed to initialize citizen: " . $e->getMessage() . "</p>";
}
?>
