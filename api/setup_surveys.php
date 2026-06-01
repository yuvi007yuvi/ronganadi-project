<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$db = getDB();

try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS custom_surveys (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            title         VARCHAR(255) NOT NULL,
            description   TEXT,
            fields_json   JSON NOT NULL,
            assigned_to   JSON,
            status        ENUM('active','draft','archived') DEFAULT 'active',
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by    INT,
            FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $db->exec("
        CREATE TABLE IF NOT EXISTS custom_survey_responses (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            survey_id     INT NOT NULL,
            surveyor_id   INT,
            citizen_phone VARCHAR(20),
            responses_json JSON NOT NULL,
            submitted_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (survey_id) REFERENCES custom_surveys(id) ON DELETE CASCADE,
            FOREIGN KEY (surveyor_id) REFERENCES surveyors(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    jsonResponse(['message' => 'Custom survey tables created successfully']);
} catch (PDOException $e) {
    jsonError(500, 'Database error: ' . $e->getMessage());
}
