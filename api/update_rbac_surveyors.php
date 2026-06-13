<?php
require_once __DIR__ . '/config.php';

try {
    $db = getDB();
    
    // Dynamically check the column type of `id` in surveyors and rbac_roles
    // to prevent "Foreign key constraint is incorrectly formed" (errno 150)
    $stmt1 = $db->query("SHOW COLUMNS FROM surveyors WHERE Field = 'id'");
    $surveyorCol = $stmt1->fetch();
    $surveyorType = $surveyorCol ? $surveyorCol['Type'] : 'INT'; // e.g., 'int(11)' or 'bigint(20) unsigned'

    $stmt2 = $db->query("SHOW COLUMNS FROM rbac_roles WHERE Field = 'id'");
    $roleCol = $stmt2->fetch();
    $roleType = $roleCol ? $roleCol['Type'] : 'INT';

    // Create RBAC Surveyor Roles Mapping Table
    $db->exec("
        CREATE TABLE IF NOT EXISTS rbac_surveyor_roles (
            surveyor_id $surveyorType NOT NULL,
            role_id $roleType NOT NULL,
            PRIMARY KEY (surveyor_id, role_id),
            FOREIGN KEY (surveyor_id) REFERENCES surveyors(id) ON DELETE CASCADE,
            FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    echo "Surveyor Roles table setup successfully.\n";
    
} catch (Exception $e) {
    echo "Error setting up surveyor roles: " . $e->getMessage() . "\n";
}
