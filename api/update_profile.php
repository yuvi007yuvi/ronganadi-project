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
$table = $user['role'] === 'admin' ? 'admins' : 'surveyors';

try {
    $updates = ["name = ?", "phone = ?"];
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

    // Return the updated user info
    $stmt = $pdo->prepare("SELECT id, name, email, phone, profile_photo" . ($user['role'] === 'surveyor' ? ", assigned_area" : "") . " FROM $table WHERE id = ?");
    $stmt->execute([$user['id']]);
    $updatedUser = $stmt->fetch();
    
    if (!$updatedUser) {
        jsonError(404, 'User not found after update');
    }
    
    $updatedUser['role'] = $user['role'];
    
    $payload = [
        'id' => $updatedUser['id'],
        'email' => $updatedUser['email'],
        'role' => $user['role'],
        'name' => $updatedUser['name'],
        'profile_photo' => $updatedUser['profile_photo']
    ];
    $token = generateJWT($payload);

    jsonResponse([
        'user' => $updatedUser,
        'token' => $token
    ]);
} catch (Exception $e) {
    jsonError(500, 'Failed to update profile: ' . $e->getMessage());
}
?>
