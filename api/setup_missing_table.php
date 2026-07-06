<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$db = getDB();

try {
    // 1. Create table
    $db->exec("
        CREATE TABLE IF NOT EXISTS grievance_complaint_types (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            name          VARCHAR(100) NOT NULL UNIQUE,
            department_id INT,
            FOREIGN KEY (department_id) REFERENCES grievance_departments(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    echo "Table 'grievance_complaint_types' created/verified successfully.<br>";

    // 2. Seed types
    $count = $db->query("SELECT COUNT(*) FROM grievance_complaint_types")->fetchColumn();
    if ($count == 0) {
        $db->exec("
            INSERT INTO grievance_complaint_types (name, department_id) VALUES
            ('Water Supply', 1),
            ('Roads & Infrastructure', 2),
            ('Electricity', 3),
            ('Sanitation & Solid Waste', 4),
            ('Sewer & Drainage', 5);
        ");
        echo "Default complaint types seeded successfully.<br>";
    } else {
        echo "Complaint types already seeded.<br>";
    }

    echo "<strong>Database setup verified successfully.</strong>";

} catch (Exception $e) {
    echo "Error setting up table: " . $e->getMessage();
}
?>
