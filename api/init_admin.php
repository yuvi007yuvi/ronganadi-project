<?php
require_once __DIR__ . '/config.php';

$db = getDB();

try {
    // 1. Delete any existing admin with this email
    $stmt = $db->prepare('DELETE FROM admins WHERE email = ?');
    $stmt->execute(['admin@ronganadi.gov.in']);

    // 2. Hash the exact password 'admin123'
    $password = 'admin123';
    $hash = password_hash($password, PASSWORD_DEFAULT);

    // 3. Insert the fresh admin record
    $stmt = $db->prepare('
        INSERT INTO admins (name, email, password_hash, phone, designation) 
        VALUES (?, ?, ?, ?, ?)
    ');
    
    $stmt->execute([
        'Rajiv Borah',
        'admin@ronganadi.gov.in',
        $hash,
        '9435000001',
        'District Coordinator'
    ]);

    echo "<h2>SUCCESS!</h2>";
    echo "<p>The admin account has been completely recreated.</p>";
    echo "<p><strong>Email:</strong> admin@ronganadi.gov.in</p>";
    echo "<p><strong>Password:</strong> admin123</p>";
    echo "<p>You can now go back to the login page, click the Auto-fill button, and it will work 100%.</p>";

} catch (Exception $e) {
    echo "<h2>ERROR!</h2>";
    echo "<p>Could not recreate admin account: " . $e->getMessage() . "</p>";
}
?>
