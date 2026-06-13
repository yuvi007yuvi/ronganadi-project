<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

try {
    $db = getDB();
    $db->beginTransaction();

    // 1. Create admin_departments table for many-to-many relationship
    $db->exec("
        CREATE TABLE IF NOT EXISTS `admin_departments` (
            `admin_id` int(11) NOT NULL,
            `department_id` int(11) NOT NULL,
            PRIMARY KEY (`admin_id`, `department_id`),
            KEY `fk_ad_dept` (`department_id`),
            CONSTRAINT `fk_ad_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
            CONSTRAINT `fk_ad_dept` FOREIGN KEY (`department_id`) REFERENCES `grievance_departments` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 2. Migrate existing department_ids from admins table to the new table
    // (Ignoring errors if column already removed, though we aren't removing it yet to be safe)
    try {
        $stmt = $db->query("SELECT id, department_id FROM admins WHERE department_id IS NOT NULL");
        $existing = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $insertStmt = $db->prepare("INSERT IGNORE INTO admin_departments (admin_id, department_id) VALUES (?, ?)");
        foreach ($existing as $row) {
            $insertStmt->execute([$row['id'], $row['department_id']]);
        }
    } catch (Exception $e) {
        // column might not exist or error occurred, ignore
    }

    // 3. Define all core modules/permissions
    $permissions = [
        ['name' => 'manage_complaints', 'description' => 'Access and manage the Complaints Desk', 'module' => 'Grievances'],
        ['name' => 'view_reports', 'description' => 'View system reports and analytics', 'module' => 'Reports'],
        ['name' => 'manage_surveys', 'description' => 'Create and manage custom surveys', 'module' => 'Surveys'],
        ['name' => 'manage_users', 'description' => 'Manage system users and citizens', 'module' => 'Users'],
        ['name' => 'manage_advertisements', 'description' => 'Manage banners and advertisements', 'module' => 'Engagement'],
        ['name' => 'manage_facilities', 'description' => 'Manage nearby facilities and mapping', 'module' => 'Facilities'],
        ['name' => 'view_migrated_surveys', 'description' => 'View legacy migrated surveys data', 'module' => 'Surveys'],
        ['name' => 'view_feedback', 'description' => 'View citizen feedback', 'module' => 'Engagement']
    ];

    $insertPerm = $db->prepare("INSERT IGNORE INTO rbac_permissions (name, description, module) VALUES (?, ?, ?)");
    foreach ($permissions as $p) {
        $insertPerm->execute([$p['name'], $p['description'], $p['module']]);
    }

    // 4. Create "Grievance Manager" default role if it doesn't exist
    $stmt = $db->query("SELECT id FROM rbac_roles WHERE name = 'Grievance Manager' LIMIT 1");
    $roleRow = $stmt->fetch();
    
    if (!$roleRow) {
        $db->exec("INSERT INTO rbac_roles (name, description, is_system) VALUES ('Grievance Manager', 'Handles department specific complaints and tickets', 0)");
        $roleId = $db->lastInsertId();
    } else {
        $roleId = $roleRow['id'];
    }

    // Assign 'manage_complaints' to 'Grievance Manager'
    $stmt = $db->prepare("SELECT id FROM rbac_permissions WHERE name = 'manage_complaints' LIMIT 1");
    $stmt->execute();
    $permId = $stmt->fetchColumn();

    if ($permId) {
        $db->prepare("INSERT IGNORE INTO rbac_role_permissions (role_id, permission_id) VALUES (?, ?)")
           ->execute([$roleId, $permId]);
    }

    $db->commit();
    echo "<h1>Success!</h1><p>MBAC tables, permissions, and Grievance Manager role initialized.</p>";
    
} catch (Exception $e) {
    if (isset($db)) $db->rollBack();
    echo "<h1>Error</h1><p>" . $e->getMessage() . "</p>";
}
