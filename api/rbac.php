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

// 4. Assign Role
if ($method === 'POST' && $action === 'assign_role') {
    $user_id = $input['user_id'] ?? null;
    $role_id = $input['role_id'] ?? null;
    $user_type = $input['user_type'] ?? 'admin';
    
    if (!$user_id || !$role_id) jsonError(400, 'User ID and Role ID required');
    
    try {
        if ($user_type === 'admin') {
            $stmt = $db->prepare("REPLACE INTO rbac_admin_roles (admin_id, role_id) VALUES (?, ?)");
            $stmt->execute([$user_id, $role_id]);
        } else {
            $stmt = $db->prepare("REPLACE INTO rbac_surveyor_roles (surveyor_id, role_id) VALUES (?, ?)");
            $stmt->execute([$user_id, $role_id]);
        }
        jsonResponse(['success' => true]);
    } catch (Exception $e) {
        jsonError(500, 'Failed to assign role');
    }
}

// 5. Get Users with Roles
if ($method === 'GET' && $action === 'get_users_roles') {
    try {
        $stmt = $db->query("
            SELECT a.id, a.name, a.email, a.designation, r.id as role_id, r.name as role_name, 'admin' as user_type 
            FROM admins a 
            LEFT JOIN rbac_admin_roles ar ON a.id = ar.admin_id
            LEFT JOIN rbac_roles r ON ar.role_id = r.id
            UNION ALL
            SELECT s.id, s.name, s.email, 'Surveyor' as designation, r.id as role_id, r.name as role_name, 'surveyor' as user_type 
            FROM surveyors s
            LEFT JOIN rbac_surveyor_roles sr ON s.id = sr.surveyor_id
            LEFT JOIN rbac_roles r ON sr.role_id = r.id
        ");
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (Exception $e) {
        jsonError(400, 'Database error: ' . $e->getMessage());
    }
}

jsonError(400, 'Invalid request');
