<?php
require_once __DIR__ . '/config.php';

try {
    $db = getDB();
    $stmt = $db->query("SHOW CREATE TABLE surveyors");
    $surveyors = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $stmt2 = $db->query("SHOW CREATE TABLE rbac_roles");
    $rbac_roles = $stmt2->fetch(PDO::FETCH_ASSOC);

    echo "SURVEYORS:\n";
    print_r($surveyors);
    
    echo "\nRBAC_ROLES:\n";
    print_r($rbac_roles);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
