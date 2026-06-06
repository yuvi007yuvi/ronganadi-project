<?php
require_once __DIR__ . '/config.php';

try {
    $db = getDB();
    
    // Create RBAC Roles Table
    $db->exec("
        CREATE TABLE IF NOT EXISTS rbac_roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            is_system TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    
    // Create RBAC Permissions Table
    $db->exec("
        CREATE TABLE IF NOT EXISTS rbac_permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            module VARCHAR(50) DEFAULT 'general',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    
    // Create RBAC Role Permissions Mapping Table
    $db->exec("
        CREATE TABLE IF NOT EXISTS rbac_role_permissions (
            role_id INT NOT NULL,
            permission_id INT NOT NULL,
            PRIMARY KEY (role_id, permission_id),
            FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE,
            FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    
    // Create RBAC Admin Roles Mapping Table
    $db->exec("
        CREATE TABLE IF NOT EXISTS rbac_admin_roles (
            admin_id INT NOT NULL,
            role_id INT NOT NULL,
            PRIMARY KEY (admin_id, role_id),
            FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
            FOREIGN KEY (role_id) REFERENCES rbac_roles(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // Insert Default Permissions
    $permissions = [
        ['view_dashboard', 'Can view the main admin dashboard', 'core'],
        ['manage_users', 'Can create, edit, and delete users', 'users'],
        ['manage_nearby', 'Can manage nearby facilities and types', 'gis'],
        ['manage_surveys', 'Can create and assign custom surveys', 'surveys'],
        ['manage_complaints', 'Can update and close citizen complaints', 'grievance'],
        ['manage_roles', 'Can create custom roles and assign permissions', 'rbac']
    ];
    
    $stmt = $db->prepare("INSERT IGNORE INTO rbac_permissions (name, description, module) VALUES (?, ?, ?)");
    foreach ($permissions as $perm) {
        $stmt->execute($perm);
    }

    // Insert Default Super Admin Role
    $db->exec("INSERT IGNORE INTO rbac_roles (id, name, description, is_system) VALUES (1, 'Super Admin', 'Full access to all system modules', 1)");
    
    // Assign all permissions to Super Admin role
    $db->exec("
        INSERT IGNORE INTO rbac_role_permissions (role_id, permission_id)
        SELECT 1, id FROM rbac_permissions
    ");

    // Assign Super Admin role to the first admin (admin@ronganadi.gov.in)
    $db->exec("
        INSERT IGNORE INTO rbac_admin_roles (admin_id, role_id)
        SELECT id, 1 FROM admins WHERE email = 'admin@ronganadi.gov.in' LIMIT 1
    ");

    echo "RBAC Module setup successfully.\n";
    
} catch (Exception $e) {
    echo "Error setting up RBAC module: " . $e->getMessage() . "\n";
}
