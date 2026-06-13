<?php
require_once __DIR__ . '/config.php';
$db = getDB();

echo "<h2>Database Diagnosis for Foreign Key Error 150</h2><pre>";

function checkTable($db, $tableName) {
    try {
        $stmt = $db->query("SHOW CREATE TABLE `$tableName`");
        echo $stmt->fetchColumn(1) . "\n\n";
    } catch (Exception $e) {
        echo "Table `$tableName` does NOT exist or could not be described.\n\n";
    }
}

checkTable($db, 'surveyors');
checkTable($db, 'rbac_roles');
checkTable($db, 'admins');

echo "</pre>";
