<?php
require_once __DIR__ . '/config.php';
$db = getDB();

try {
    $db->exec("ALTER TABLE citizens ADD COLUMN password_hash VARCHAR(255) NULL AFTER mobile");
    echo "Successfully added password_hash to citizens table.\n";
} catch (PDOException $e) {
    echo "Migration error (may already exist): " . $e->getMessage() . "\n";
}
