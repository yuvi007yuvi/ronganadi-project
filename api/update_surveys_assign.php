<?php
require_once __DIR__ . '/config.php';

$pdo = getDB();
$sql = "ALTER TABLE custom_surveys ADD COLUMN assigned_to JSON DEFAULT NULL AFTER fields_json;";

try {
    $pdo->exec($sql);
    echo "Successfully added 'assigned_to' column to custom_surveys table.<br>";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "'assigned_to' column already exists in custom_surveys table.<br>";
    } else {
        echo "Error: " . $e->getMessage() . "<br>";
    }
}
?>
