-- ══════════════════════════════════════════════════════════
--  Ronganadi Beta – MySQL Database Schema
--  Run this in Hostinger hPanel → phpMyAdmin
--  Database: create one named e.g. "ronganadi" first
-- ══════════════════════════════════════════════════════════

SET NAMES utf8mb4;
SET time_zone = '+05:30';

-- ─── Admins ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(100)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    phone         VARCHAR(15),
    designation   VARCHAR(100),
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default admin: admin@ronganadi.gov.in / admin123
INSERT INTO admins (name, email, password_hash, phone, designation)
VALUES (
    'Rajiv Borah',
    'admin@ronganadi.gov.in',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    '9435000001',
    'District Coordinator'
) ON DUPLICATE KEY UPDATE email = email;

-- ─── Surveyors ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS surveyors (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(100)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    phone         VARCHAR(15),
    assigned_area VARCHAR(200),
    status        ENUM('active','inactive') DEFAULT 'active',
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Demo surveyors (password: survey123)
INSERT IGNORE INTO surveyors (name, email, password_hash, phone, assigned_area, status) VALUES
('Priya Hazarika', 'priya@ronganadi.gov.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9435100001', 'Ward 1 – North Ronganadi', 'active'),
('Dipak Kalita',   'dipak@ronganadi.gov.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9435100002', 'Ward 2 – South Ronganadi', 'active'),
('Munmi Devi',     'munmi@ronganadi.gov.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9435100003', 'Ward 3 – East Ronganadi',  'active');

-- NOTE: The hashes above use password: "password" from bcrypt placeholder.
-- Run this PHP to generate correct hashes:
--   echo password_hash('admin123', PASSWORD_DEFAULT);
--   echo password_hash('survey123', PASSWORD_DEFAULT);
-- Then UPDATE admins SET password_hash='...' WHERE email='...';
-- UPDATE surveyors SET password_hash='...' WHERE email='...';

-- ─── Citizens (Survey Records) ────────────────────────────
CREATE TABLE IF NOT EXISTS citizens (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    full_name           VARCHAR(150) NOT NULL,
    mobile              VARCHAR(15)  NOT NULL,
    address             TEXT         NOT NULL,
    area                VARCHAR(200) NOT NULL,
    voter_id_number     VARCHAR(50),
    pan_number          VARCHAR(15),
    caste_category      VARCHAR(100),
    occupation          VARCHAR(100),
    schemes_availed     JSON,          -- Array of scheme IDs
    schemes_not_availed JSON,          -- Array of scheme IDs
    remarks             TEXT,
    surveyor_id         INT,
    surveyor_name       VARCHAR(100),
    submitted_at        DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_area         (area),
    INDEX idx_surveyor     (surveyor_id),
    INDEX idx_submitted    (submitted_at),
    INDEX idx_mobile       (mobile),
    FOREIGN KEY (surveyor_id) REFERENCES surveyors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Announcements ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    content      TEXT         NOT NULL,
    type         ENUM('announcement','news','event','notice') DEFAULT 'announcement',
    priority     ENUM('high','medium','low') DEFAULT 'medium',
    published    TINYINT(1)   DEFAULT 1,
    published_at DATE,
    expires_at   DATE,
    created_by   INT,
    created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_published (published),
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Demo announcement
INSERT INTO announcements (title, content, type, priority, published, published_at, expires_at, created_by)
VALUES (
    'Ronganadi Beta Survey Platform Launched',
    'The digital survey platform for Ronganadi is now live. All surveyors please log in and start data collection for Phase 1.',
    'announcement', 'high', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 1
);

-- ─── Custom Surveys ─────────────────────────────────────────
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

-- ─── Custom Survey Responses ──────────────────────────────
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

-- ══════════════════════════════════════════════════════════
--  USEFUL QUERIES
-- ══════════════════════════════════════════════════════════

-- Area-wise count:
-- SELECT area, COUNT(*) as count FROM citizens GROUP BY area ORDER BY count DESC;

-- Surveyor performance:
-- SELECT s.name, COUNT(c.id) as surveys
-- FROM surveyors s LEFT JOIN citizens c ON s.id = c.surveyor_id
-- GROUP BY s.id ORDER BY surveys DESC;

-- Scheme beneficiaries:
-- SELECT COUNT(*) FROM citizens WHERE JSON_LENGTH(schemes_availed) > 0;
