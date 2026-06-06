<?php
require_once __DIR__ . '/config.php';

try {
    $db = getDB();
    
    // Create RBAC Surveyor Roles Mapping Table
    $db->exec("
        CREATE TABLE IF NOT EXISTS rbac_surveyor_roles (
            surveyor_id INT NOT NULL,
            role_id INT NOT NULL,
            PRIMARY KEY (surveyor_id, role_id),
            FOREIGN KEY (surveyor_id) REFERENCES surveyors(id) ON DELETE CASCADE,
            FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    echo "Surveyor Roles table setup successfully.\n";
    
} catch (Exception $e) {
    echo "Error setting up surveyor roles: " . $e->getMessage() . "\n";
}
