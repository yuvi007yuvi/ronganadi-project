<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$db = getDB();

try {
    $db->exec("ALTER TABLE admins ADD COLUMN department_id INT NULL AFTER designation");
    $db->exec("ALTER TABLE admins ADD FOREIGN KEY (department_id) REFERENCES grievance_departments(id) ON DELETE SET NULL");
    
    echo "<h1>Migration Successful</h1>";
    echo "<p>Added department_id column to admins table.</p>";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "<h1>Migration Already Run</h1>";
        echo "<p>department_id column already exists.</p>";
    } else {
        echo "<h1>Migration Failed</h1>";
        echo "<p>" . $e->getMessage() . "</p>";
    }
}
?>
