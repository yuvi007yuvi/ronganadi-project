<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$input = getInput();
$db = getDB();

// Ensure user is authenticated
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    jsonError(401, 'Missing token');
}
$token = $matches[1];
$user = verifyJWT($token);
if (!$user || $user['role'] !== 'admin') {
    jsonError(403, 'Unauthorized access');
}

$action = $_GET['action'] ?? '';

// 1. Get Roles
if ($method === 'GET' && $action === 'get_roles') {
    $stmt = $db->query("SELECT * FROM rbac_roles");
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // get permissions for each
    foreach ($roles as &$role) {
        $stmt2 = $db->prepare("SELECT p.* FROM rbac_permissions p JOIN rbac_role_permissions rp ON p.id = rp.permission_id WHERE rp.role_id = ?");
        $stmt2->execute([$role['id']]);
        $role['permissions'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    }
    
    jsonResponse($roles);
}

// 2. Get Permissions
if ($method === 'GET' && $action === 'get_permissions') {
    $stmt = $db->query("SELECT * FROM rbac_permissions ORDER BY module, name");
    jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// 3. Create Role
if ($method === 'POST' && $action === 'create_role') {
    $name = $input['name'] ?? '';
    $description = $input['description'] ?? '';
    $permissions = $input['permissions'] ?? [];
    
    if (!$name) jsonError(400, 'Role name required');
    
    try {
        $db->beginTransaction();
        
        $stmt = $db->prepare("INSERT INTO rbac_roles (name, description) VALUES (?, ?)");
        $stmt->execute([$name, $description]);
        $role_id = $db->lastInsertId();
        
        if (!empty($permissions)) {
            $stmtPerm = $db->prepare("INSERT INTO rbac_role_permissions (role_id, permission_id) VALUES (?, ?)");
            foreach ($permissions as $perm_id) {
                $stmtPerm->execute([$role_id, $perm_id]);
            }
        }
        
        $db->commit();
        jsonResponse(['success' => true, 'id' => $role_id]);
    } catch (Exception $e) {
        $db->rollBack();
        jsonError(500, 'Failed to create role');
    }
}

// 4. Update Role
if ($method === 'POST' && $action === 'update_role') {
    $id = $input['id'] ?? null;
    $name = $input['name'] ?? null;
    $desc = $input['description'] ?? '';
    $perms = $input['permissions'] ?? [];
    
    if (!$id || !$name) jsonError(400, 'Missing required fields');
    
    try {
        $db->beginTransaction();
        
        $stmt = $db->prepare("UPDATE rbac_roles SET name = ?, description = ? WHERE id = ? AND is_system = 0");
        $stmt->execute([$name, $desc, $id]);
        
        $stmt = $db->prepare("DELETE FROM rbac_role_permissions WHERE role_id = ?");
        $stmt->execute([$id]);
        
        if (!empty($perms)) {
            $stmt = $db->prepare("INSERT INTO rbac_role_permissions (role_id, permission_id) VALUES (?, ?)");
            foreach ($perms as $perm_id) {
                $stmt->execute([$id, $perm_id]);
            }
        }
        
        $db->commit();
        jsonResponse(['success' => true]);
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        jsonError(500, 'Failed to update role');
    }
}

// 5. Delete Role
if ($method === 'POST' && $action === 'delete_role') {
    $id = $input['id'] ?? null;
    if (!$id) jsonError(400, 'Role ID required');
    try {
        $stmt = $db->prepare("DELETE FROM rbac_roles WHERE id = ? AND is_system = 0");
        $stmt->execute([$id]);
        jsonResponse(['success' => true]);
    } catch (Exception $e) {
        jsonError(500, 'Failed to delete role');
    }
}

// 6. Assign Role
if ($method === 'POST' && $action === 'assign_role') {
    $user_id = $input['user_id'] ?? null;
    $role_id = $input['role_id'] ?? null;
    
    if (!$user_id || !$role_id) jsonError(400, 'User ID and Role ID required');
    
    try {
        $db->beginTransaction();
        // Delete old roles
        $stmt = $db->prepare("DELETE FROM rbac_admin_roles WHERE admin_id = ?");
        $stmt->execute([$user_id]);
        
        // Insert new role
        $stmt = $db->prepare("INSERT INTO rbac_admin_roles (admin_id, role_id) VALUES (?, ?)");
        $stmt->execute([$user_id, $role_id]);
        
        $db->commit();
        jsonResponse(['success' => true]);
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        jsonError(500, 'Failed to assign role');
    }
}

// 7. Get Users with Roles
if ($method === 'GET' && $action === 'get_users_roles') {
    try {
        $stmt = $db->query("
            SELECT a.id, a.name, a.email, a.designation, 
                   (SELECT GROUP_CONCAT(department_id) FROM admin_departments WHERE admin_id = a.id) as department_ids,
                   r.id as role_id, r.name as role_name 
            FROM admins a 
            LEFT JOIN rbac_admin_roles ar ON a.id = ar.admin_id
            LEFT JOIN rbac_roles r ON ar.role_id = r.id
            GROUP BY a.id, a.name, a.email, a.designation, r.id, r.name
        ");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($users as &$u) {
            $u['department_ids'] = $u['department_ids'] ? explode(',', $u['department_ids']) : [];
        }
        jsonResponse($users);
    } catch (Exception $e) {
        jsonError(400, 'Database error: ' . $e->getMessage());
    }
}

// 8. Create Admin
if ($method === 'POST' && $action === 'create_admin') {
    $name = $input['name'] ?? null;
    $email = $input['email'] ?? null;
    $pass = $input['password'] ?? null;
    $designation = $input['designation'] ?? null;
    $departments = isset($input['department_ids']) && is_array($input['department_ids']) ? $input['department_ids'] : [];
    if (!$name || !$email || !$pass) jsonError(400, 'Name, email and password required');
    
    try {
        $db->beginTransaction();
        $stmt = $db->prepare("INSERT INTO admins (name, email, password_hash, designation, department_id) VALUES (?, ?, ?, ?, NULL)");
        $stmt->execute([$name, $email, password_hash($pass, PASSWORD_DEFAULT), $designation]);
        $adminId = $db->lastInsertId();

        if (!empty($departments)) {
            $deptStmt = $db->prepare("INSERT INTO admin_departments (admin_id, department_id) VALUES (?, ?)");
            foreach ($departments as $did) {
                $deptStmt->execute([$adminId, intval($did)]);
            }
        }
        $db->commit();
        jsonResponse(['success' => true]);
    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError(500, 'Failed to create admin');
    }
}

// 9. Update Admin
if ($method === 'POST' && $action === 'update_admin') {
    $id = $input['id'] ?? null;
    $name = $input['name'] ?? null;
    $email = $input['email'] ?? null;
    $pass = $input['password'] ?? null;
    $designation = $input['designation'] ?? null;
    $departments = isset($input['department_ids']) && is_array($input['department_ids']) ? $input['department_ids'] : [];
    
    if (!$id || !$name || !$email) jsonError(400, 'Required fields missing');
    
    try {
        $db->beginTransaction();
        if ($pass) {
            $stmt = $db->prepare("UPDATE admins SET name=?, email=?, designation=?, password_hash=? WHERE id=?");
            $stmt->execute([$name, $email, $designation, password_hash($pass, PASSWORD_DEFAULT), $id]);
        } else {
            $stmt = $db->prepare("UPDATE admins SET name=?, email=?, designation=? WHERE id=?");
            $stmt->execute([$name, $email, $designation, $id]);
        }

        // Update departments
        $db->prepare("DELETE FROM admin_departments WHERE admin_id = ?")->execute([$id]);
        if (!empty($departments)) {
            $deptStmt = $db->prepare("INSERT INTO admin_departments (admin_id, department_id) VALUES (?, ?)");
            foreach ($departments as $did) {
                $deptStmt->execute([$id, intval($did)]);
            }
        }

        $db->commit();
        jsonResponse(['success' => true]);
    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError(500, 'Failed to update admin');
    }
}

// 10. Delete Admin
if ($method === 'POST' && $action === 'delete_admin') {
    $id = $input['id'] ?? null;
    if (!$id) jsonError(400, 'Admin ID required');
    try {
        // Prevent deleting the main super admin (admin_id = 1) just to be safe
        if ($id == 1) jsonError(403, 'Cannot delete main super admin');
        
        $stmt = $db->prepare("DELETE FROM admins WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['success' => true]);
    } catch (Exception $e) {
        jsonError(500, 'Failed to delete admin');
    }
}

jsonError(400, 'Invalid request');
