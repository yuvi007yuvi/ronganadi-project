<?php
require_once __DIR__ . '/config.php';

$pdo = getDB();
try {
    $pdo->exec("ALTER TABLE citizens ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL;");
    echo "Successfully added profile_photo to citizens table.<br>";
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Column already exists. You are good to go!<br>";
    } else {
        echo "Error: " . $e->getMessage() . "<br>";
    }
}
?>
