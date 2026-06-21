<?php
require_once __DIR__ . '/../api/config.php';

try {
    $db = getDB();
    $stmt = $db->query("
            SELECT a.id, a.name, a.email, a.designation, 
                   (SELECT GROUP_CONCAT(department_id) FROM admin_departments WHERE admin_id = a.id) as department_ids,
                   r.id as role_id, r.name as role_name, 'admin' as source
            FROM admins a 
            LEFT JOIN rbac_admin_roles ar ON a.id = ar.admin_id
            LEFT JOIN rbac_roles r ON ar.role_id = r.id
            GROUP BY a.id, a.name, a.email, a.designation, r.id, r.name
            
            UNION ALL
            
            SELECT c.id, c.full_name as name, c.mobile as email, 'Citizen' as designation,
                   NULL as department_ids,
                   NULL as role_id, NULL as role_name, 'citizen' as source
            FROM citizens c
            WHERE NOT EXISTS (SELECT 1 FROM admins a WHERE a.email = c.mobile)
    ");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($users);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
