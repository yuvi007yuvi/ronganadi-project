<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

if ($method === 'GET') {
    $user = requireAuth();
    
    // Admins see all, citizens see their own
    if ($user['role'] === 'admin') {
        $stmt = $db->query("
            SELECT r.*, cs.title as survey_title 
            FROM custom_survey_responses r 
            LEFT JOIN custom_surveys cs ON r.survey_id = cs.id
            ORDER BY r.submitted_at DESC
        ");
    } else {
        $stmt = $db->prepare("
            SELECT r.*, cs.title as survey_title 
            FROM custom_survey_responses r 
            LEFT JOIN custom_surveys cs ON r.survey_id = cs.id
            WHERE r.citizen_phone = ? 
            ORDER BY r.submitted_at DESC
        ");
        $stmt->execute([$user['mobile']]);
    }
    
    $responses = $stmt->fetchAll();
    foreach ($responses as &$r) {
        $r['responses_json'] = json_decode($r['responses_json'], true);
    }
    jsonResponse($responses);
}

if ($method === 'POST') {
    $user = requireAuth();
    $data = getInput();
    
    if (empty($data['survey_id']) || empty($data['responses_json'])) {
        jsonError(400, 'Survey ID and responses are required');
    }

    $stmt = $db->prepare('
        INSERT INTO custom_survey_responses (survey_id, citizen_phone, responses_json, submitted_at)
        VALUES (?, ?, ?, NOW())
    ');
    
    $stmt->execute([
        $data['survey_id'],
        $data['citizen_phone'] ?? null,
        json_encode($data['responses_json'])
    ]);
    
    jsonResponse(['id' => $db->lastInsertId()], 201);
}

jsonError(405, 'Method not allowed');
