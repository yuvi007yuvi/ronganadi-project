<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$user = requireAuth();
$input = getInput();

$name = trim($input['name'] ?? '');
$phone = trim($input['phone'] ?? '');
$password = trim($input['password'] ?? '');
$profile_photo = $input['profile_photo'] ?? null;

if (!$name) {
    jsonError(400, 'Name is required');
}

$pdo = getDB();
    try {
    if ($user['role'] === 'admin') {
        $table = 'admins';
        $updates = ["name = ?", "phone = ?"];
    } elseif ($user['role'] === 'citizen') {
        $table = 'citizens';
        $updates = ["full_name = ?", "mobile = ?"];
    } else {
        $table = 'surveyors';
        $updates = ["name = ?", "phone = ?"];
    }

    $params = [$name, $phone];
    
    if ($password) {
        $updates[] = "password_hash = ?";
        $params[] = password_hash($password, PASSWORD_DEFAULT);
    }
    
    if ($profile_photo !== null) {
        $updates[] = "profile_photo = ?";
        $params[] = $profile_photo;
    }
    
    $params[] = $user['id'];
    $setStr = implode(", ", $updates);
    
    $stmt = $pdo->prepare("UPDATE $table SET $setStr WHERE id = ?");
    $stmt->execute($params);

    // Update the JWT payload with the new values
    $payload = $user;
    $payload['name'] = $name;
    if ($user['role'] === 'citizen') {
        $payload['mobile'] = $phone;
    } else {
        $payload['phone'] = $phone;
    }
    if ($profile_photo !== null) {
        $payload['profile_photo'] = $profile_photo;
    }
    
    $token = generateJWT($payload);

    jsonResponse([
        'user' => $payload,
        'token' => $token
    ]);
} catch (Exception $e) {
    jsonError(500, 'Failed to update profile: ' . $e->getMessage());
}
?>
