<?php
require_once __DIR__ . '/config.php';

try {
    $db = getDB();
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "TABLES IN DB:\n";
    print_r($tables);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
