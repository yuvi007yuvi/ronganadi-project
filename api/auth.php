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
        $token = generateJWT([
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => 'admin',
            'designation' => $user['designation'],
        ]);
        jsonResponse([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => 'admin',
                'designation' => $user['designation'],
                'phone' => $user['phone'],
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
