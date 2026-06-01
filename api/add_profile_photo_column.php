<?php
require_once __DIR__ . '/config.php';

$pdo = getDB();
try {
    $pdo->exec("ALTER TABLE admins ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL;");
    echo "Added profile_photo to admins.<br>";
} catch (Exception $e) {
    echo "Admins: " . $e->getMessage() . "<br>";
}

try {
    $pdo->exec("ALTER TABLE surveyors ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL;");
    echo "Added profile_photo to surveyors.<br>";
} catch (Exception $e) {
    echo "Surveyors: " . $e->getMessage() . "<br>";
}
?>
