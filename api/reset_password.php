<?php
require_once __DIR__ . '/config.php';

$db = getDB();

// Hash for 'admin123'
$newHash = password_hash('admin123', PASSWORD_DEFAULT);

$stmt = $db->prepare('UPDATE admins SET password_hash = ? WHERE email = ?');
$stmt->execute([$newHash, 'admin@ronganadi.gov.in']);

echo "Password for admin@ronganadi.gov.in has been successfully reset to: admin123";
?>
