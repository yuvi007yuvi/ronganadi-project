<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$db = getDB();
$messages = [];

try {
    // Disable foreign key checks to prevent constraint violations
    $db->exec('SET FOREIGN_KEY_CHECKS=0');

    // 1. Drop the old surveyors table
    $db->exec('DROP TABLE IF EXISTS surveyors');
    $messages[] = "Dropped surveyors table (if it existed).";

    // 2. Remove surveyor columns from citizens
    try {
        // Drop the constraint first!
        try { $db->exec('ALTER TABLE citizens DROP FOREIGN KEY citizens_ibfk_1'); } catch (Exception $ex) {}
        $db->exec('ALTER TABLE citizens DROP COLUMN surveyor_id, DROP COLUMN surveyor_name');
        $messages[] = "Removed surveyor columns from citizens table.";
    } catch (PDOException $e) {
        $messages[] = "Surveyor columns in citizens table already removed or error: " . $e->getMessage();
    }

    // 3. Remove surveyor_id from custom_survey_responses
    try {
        // Drop the constraint first!
        try { $db->exec('ALTER TABLE custom_survey_responses DROP FOREIGN KEY custom_survey_responses_ibfk_2'); } catch (Exception $ex) {}
        $db->exec('ALTER TABLE custom_survey_responses DROP COLUMN surveyor_id');
        $messages[] = "Removed surveyor_id from custom_survey_responses table.";
    } catch (PDOException $e) {
        $messages[] = "surveyor_id in custom_survey_responses already removed or error: " . $e->getMessage();
    }

    // 4. Add status column to citizens
    try {
        $db->exec("ALTER TABLE citizens ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'");
        $messages[] = "Added status column to citizens table.";
    } catch (PDOException $e) {
        $messages[] = "Status column already exists or error: " . $e->getMessage();
    }

    // Re-enable foreign key checks
    $db->exec('SET FOREIGN_KEY_CHECKS=1');

    jsonResponse(['message' => 'Database cleanup complete!', 'details' => $messages]);

} catch (Exception $e) {
    // Attempt to re-enable on failure just in case
    try { $db->exec('SET FOREIGN_KEY_CHECKS=1'); } catch (Exception $ex) {}
    jsonError(500, "Cleanup failed: " . $e->getMessage());
}
