-- ══════════════════════════════════════════════════════════
--  Ronganadi Beta – Grievance Management Database Schema
-- ══════════════════════════════════════════════════════════

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── Departments Table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS grievance_departments (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    head_officer  VARCHAR(100),
    status        ENUM('active', 'inactive') DEFAULT 'active',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Officers Table ─────────────────────────────────────────
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

-- ─── Complaints Table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS grievance_complaints (
    id                     INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id              VARCHAR(50) UNIQUE NOT NULL,
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
    status                 ENUM('submitted', 'ticket_generated', 'dept_assigned', 'officer_assigned', 'action_taken', 'ground_inspection', 'completed') DEFAULT 'submitted',
    assigned_officer_id    INT,
    expected_completion_date DATE,
    progress               INT DEFAULT 0,
    ward                   VARCHAR(50) NOT NULL DEFAULT 'Ward 01',
    ticket_generated_at    DATETIME DEFAULT NULL,
    submitted_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at             DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES grievance_departments(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_officer_id) REFERENCES grievance_officers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Timeline Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grievance_timeline (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id   INT NOT NULL,
    status_event   VARCHAR(255) NOT NULL,
    event_description TEXT,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES grievance_complaints(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Initial Insertions ─────────────────────────────────────
INSERT IGNORE INTO grievance_departments (name, head_officer, status) VALUES
('Water Supply Department', 'Manoj Sharma', 'active'),
('Roads & Infrastructure Department', 'Amit Singh', 'active'),
('Electricity Board', 'Rajesh Kumar', 'active'),
('Sanitation & Solid Waste Dept', 'Ravi Verma', 'active'),
('Sewer & Drainage Department', 'Vijay Das', 'active');

INSERT IGNORE INTO grievance_officers (name, department_id, designation, mobile, status) VALUES
('Manoj Sharma', 1, 'Executive Engineer', '9876543210', 'active'),
('Amit Singh', 2, 'Assistant Engineer', '9876543211', 'active'),
('Rajesh Kumar', 3, 'Junior Engineer', '9876543212', 'active'),
('Ravi Verma', 4, 'Sanitation Inspector', '9876543213', 'active'),
('Vijay Das', 5, 'Assistant Engineer', '9876543214', 'active');

SET FOREIGN_KEY_CHECKS = 1;
