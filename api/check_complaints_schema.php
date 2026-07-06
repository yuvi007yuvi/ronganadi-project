<?php
require_once __DIR__ . '/config.php';
$db = getDB();
$stmt = $db->query("DESCRIBE grievance_complaints");
header('Content-Type: application/json');
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
