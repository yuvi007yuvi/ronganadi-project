<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$db = getDB();
$messages = [];

try {
    $db->exec("ALTER TABLE citizens ADD COLUMN is_migrated ENUM('yes', 'no') DEFAULT 'no'");
    $messages[] = "Successfully added 'is_migrated' column to citizens table.";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        $messages[] = "Column 'is_migrated' already exists.";
    } else {
        $messages[] = "Error adding is_migrated: " . $e->getMessage();
    }
}

try {
    $db->exec("ALTER TABLE citizens ADD COLUMN panchayat VARCHAR(255) DEFAULT NULL");
    $messages[] = "Successfully added 'panchayat' column to citizens table.";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        $messages[] = "Column 'panchayat' already exists.";
    } else {
        $messages[] = "Error adding panchayat: " . $e->getMessage();
    }
}

jsonResponse(['message' => 'Migration complete!', 'details' => $messages]);
