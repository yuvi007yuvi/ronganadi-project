<?php
require_once __DIR__ . '/config.php';
try {
    $db = getDB();
    $stmt = $db->prepare('SELECT id, email, profile_photo FROM admins');
    $stmt->execute();
    $admins = $stmt->fetchAll();
    echo json_encode($admins);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
