<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$db = getDB();

try {
    $db->beginTransaction();
    echo "<h1>Grievance Module DB Setup</h1>";

    // 1. Create grievance_departments table
    $db->exec("
        CREATE TABLE IF NOT EXISTS grievance_departments (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            name          VARCHAR(100) NOT NULL UNIQUE,
            head_officer  VARCHAR(100),
            status        ENUM('active', 'inactive') DEFAULT 'active',
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    echo "<p>Table 'grievance_departments' verified/created.</p>";

    // 2. Create grievance_officers table
    $db->exec("
        CREATE TABLE IF NOT EXISTS grievance_officers (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            name          VARCHAR(100) NOT NULL,
            department_id INT,
            designation   VARCHAR(100),
            mobile        VARCHAR(15),
            status        ENUM('active', 'inactive') DEFAULT 'active',
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (department_id) REFERENCES grievance_departments(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    echo "<p>Table 'grievance_officers' verified/created.</p>";

    // 3. Create grievance_complaints table (with nullable ticket_id)
    $db->exec("
        CREATE TABLE IF NOT EXISTS grievance_complaints (
            id                     INT AUTO_INCREMENT PRIMARY KEY,
            ticket_id              VARCHAR(50) UNIQUE NULL,
            citizen_id             INT,
            title                  VARCHAR(255) NOT NULL,
            category               VARCHAR(100) NOT NULL,
            sub_category           VARCHAR(100) NOT NULL,
            department_id          INT,
            priority               ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
            location_lat           VARCHAR(50),
            location_lng           VARCHAR(50),
            address                TEXT NOT NULL,
            description            TEXT NOT NULL,
            photo_url              VARCHAR(255),
            video_url              VARCHAR(255),
            contact_number         VARCHAR(15) NOT NULL,
            status                 ENUM('submitted', 'ticket_generated', 'assigned', 'work_started', 'completed') DEFAULT 'submitted',
            assigned_officer_id    INT,
            expected_completion_date DATE,
            progress               INT DEFAULT 0,
            ward                   VARCHAR(50) NOT NULL DEFAULT 'Ward 01',
            submitted_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at             DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE SET NULL,
            FOREIGN KEY (department_id) REFERENCES grievance_departments(id) ON DELETE SET NULL,
            FOREIGN KEY (assigned_officer_id) REFERENCES grievance_officers(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    echo "<p>Table 'grievance_complaints' verified/created.</p>";

    // 4. Create grievance_timeline table
    $db->exec("
        CREATE TABLE IF NOT EXISTS grievance_timeline (
            id             INT AUTO_INCREMENT PRIMARY KEY,
            complaint_id   INT NOT NULL,
            status_event   VARCHAR(255) NOT NULL,
            event_description TEXT,
            created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES grievance_complaints(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    echo "<p>Table 'grievance_timeline' verified/created.</p>";

    // 5. Create grievance_notifications table
    $db->exec("
        CREATE TABLE IF NOT EXISTS grievance_notifications (
            id             INT AUTO_INCREMENT PRIMARY KEY,
            citizen_id     INT NOT NULL,
            complaint_id   INT NOT NULL,
            ticket_id      VARCHAR(50) NOT NULL,
            message        TEXT NOT NULL,
            is_read        TINYINT(1) DEFAULT 0,
            created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE,
            FOREIGN KEY (complaint_id) REFERENCES grievance_complaints(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    echo "<p>Table 'grievance_notifications' verified/created.</p>";

    // 6. Initial insertions of departments & officers if empty
    $countDepts = $db->query("SELECT COUNT(*) FROM grievance_departments")->fetchColumn();
    if ($countDepts == 0) {
        $db->exec("
            INSERT INTO grievance_departments (name, head_officer, status) VALUES
            ('Water Supply Department', 'Manoj Sharma', 'active'),
            ('Roads & Infrastructure Department', 'Amit Singh', 'active'),
            ('Electricity Board', 'Rajesh Kumar', 'active'),
            ('Sanitation & Solid Waste Dept', 'Ravi Verma', 'active'),
            ('Sewer & Drainage Department', 'Vijay Das', 'active');
        ");
        $db->exec("
            INSERT INTO grievance_officers (name, department_id, designation, mobile, status) VALUES
            ('Manoj Sharma', 1, 'Executive Engineer', '9876543210', 'active'),
            ('Amit Singh', 2, 'Assistant Engineer', '9876543211', 'active'),
            ('Rajesh Kumar', 3, 'Junior Engineer', '9876543212', 'active'),
            ('Ravi Verma', 4, 'Sanitation Inspector', '9876543213', 'active'),
            ('Vijay Das', 5, 'Assistant Engineer', '9876543214', 'active');
        ");
        echo "<p>Default departments and officers seeded successfully.</p>";
    }

    // 7. Alter citizens table columns
    $citizenAlters = [
        "ALTER TABLE citizens ADD COLUMN password_hash VARCHAR(255) NULL AFTER mobile",
        "ALTER TABLE citizens ADD COLUMN panchayat VARCHAR(100) DEFAULT '' AFTER area",
        "ALTER TABLE citizens ADD COLUMN is_migrated ENUM('yes', 'no') DEFAULT 'no' AFTER panchayat",
        "ALTER TABLE citizens ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active' AFTER is_migrated"
    ];
    foreach ($citizenAlters as $alterQuery) {
        try {
            $db->exec($alterQuery);
            echo "<p>Ran migration query: $alterQuery</p>";
        } catch (PDOException $ex) {
            // Silence duplicate column warnings
        }
    }

    // 8. Seed default citizen
    $stmt = $db->prepare("DELETE FROM citizens WHERE mobile = ?");
    $stmt->execute(['9999999999']);
    $hash = password_hash('citizen123', PASSWORD_DEFAULT);
    $insert = $db->prepare("
        INSERT INTO citizens (full_name, mobile, password_hash, address, area, panchayat, is_migrated, status, submitted_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    ");
    $insert->execute([
        'Citizen Test User',
        '9999999999',
        $hash,
        'Central Colony, Ward 01',
        'Ward 01',
        'Ronganadi Panchayat',
        'no'
    ]);
    echo "<p>Citizen '9999999999' seeded with password 'citizen123'.</p>";

    $db->commit();
    echo "<h2>SUCCESS! Grievance module database setup is complete.</h2>";

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "<h2>ERROR! Setup failed: " . $e->getMessage() . "</h2>";
}
?>
