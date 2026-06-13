<?php
require_once __DIR__ . '/config.php';
$db = getDB();

echo "surveyors table:\n";
$stmt = $db->query("DESCRIBE surveyors");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "admins table:\n";
$stmt = $db->query("DESCRIBE admins");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "rbac_roles table:\n";
$stmt = $db->query("DESCRIBE rbac_roles");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
