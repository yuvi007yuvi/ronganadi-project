<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$input = getInput();

// POST /api/auth.php – Login
if ($method === 'POST') {
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? '';

    if (!$email || !$password || !$role) {
        jsonError(400, 'Identifier (Email/Mobile), password and role are required');
    }

    $db = getDB();

    if ($role === 'admin') {
        $stmt = $db->prepare('SELECT * FROM admins WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) {
            jsonError(401, 'Invalid admin credentials');
        }
        $permissions = [];
        $departments = [];
        $is_super_admin = ($user['id'] == 1);

        // Fetch permissions
        try {
            $permStmt = $db->prepare("
                SELECT DISTINCT p.name 
                FROM rbac_permissions p
                JOIN rbac_role_permissions rp ON p.id = rp.permission_id
                JOIN rbac_admin_roles ar ON rp.role_id = ar.role_id
                WHERE ar.admin_id = ?
            ");
            $permStmt->execute([$user['id']]);
            $permissions = $permStmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {}

        // Fetch custom role
        $roleStmt = $db->prepare("SELECT role_id FROM rbac_admin_roles WHERE admin_id = ?");
        $roleStmt->execute([$user['id']]);
        $has_custom_role = (bool)$roleStmt->fetchColumn();

        // Fetch multiple departments
        try {
            $deptStmt = $db->prepare("SELECT department_id FROM admin_departments WHERE admin_id = ?");
            $deptStmt->execute([$user['id']]);
            $departments = $deptStmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            if (!empty($user['department_id'])) $departments[] = $user['department_id'];
        }

        $token = generateJWT([
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => 'admin',
            'is_super_admin' => $is_super_admin,
            'has_custom_role' => $has_custom_role,
            'permissions' => $permissions,
            'departments' => $departments,
        ]);
        jsonResponse([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => 'admin',
                'is_super_admin' => $is_super_admin,
                'has_custom_role' => $has_custom_role,
                'permissions' => $permissions,
                'departments' => $departments,
                'phone' => $user['phone'] ?? null,
            ]
        ]);
    }



    if ($role === 'citizen') {
        $stmt = $db->prepare('SELECT * FROM citizens WHERE mobile = ? LIMIT 1');
        $stmt->execute([$email]); // Frontend passes mobile in the email field
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) {
            jsonError(401, 'Invalid citizen credentials');
        }
        $token = generateJWT([
            'id' => $user['id'],
            'name' => $user['full_name'],
            'mobile' => $user['mobile'],
            'role' => 'citizen',
            'area' => $user['area'],
        ]);
        jsonResponse([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['full_name'],
                'mobile' => $user['mobile'],
                'role' => 'citizen',
                'area' => $user['area'],
            ]
        ]);
    }

    jsonError(400, 'Invalid role');
}

jsonError(405, 'Method not allowed');
