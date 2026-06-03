<?php
require_once __DIR__ . '/config.php';

$db = getDB();

try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS gis_facility_types (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            icon_type VARCHAR(50) DEFAULT 'default',
            custom_fields_schema JSON,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS gis_facilities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            latitude DECIMAL(10, 8) NOT NULL,
            longitude DECIMAL(11, 8) NOT NULL,
            address TEXT NOT NULL,
            ward_number VARCHAR(50) NOT NULL,
            zone_number VARCHAR(50),
            status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
            photo_url VARCHAR(255),
            custom_fields_data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (type_id) REFERENCES gis_facility_types(id) ON DELETE RESTRICT
        );
    ");

    // Insert some default types if empty
    $stmt = $db->query("SELECT COUNT(*) FROM gis_facility_types");
    if ($stmt->fetchColumn() == 0) {
        $defaultSchema = json_encode([
            ["name" => "contact_number", "label" => "Contact Number", "type" => "text", "required" => false]
        ]);
        
        $toiletSchema = json_encode([
            ["name" => "male_seats", "label" => "Male Seats", "type" => "number", "required" => true],
            ["name" => "female_seats", "label" => "Female Seats", "type" => "number", "required" => true],
            ["name" => "water_available", "label" => "Water Available", "type" => "boolean", "required" => true],
            ["name" => "disabled_access", "label" => "Disabled Access", "type" => "boolean", "required" => false]
        ]);

        $waterTankSchema = json_encode([
            ["name" => "capacity", "label" => "Capacity (Liters)", "type" => "number", "required" => true],
            ["name" => "water_level", "label" => "Current Water Level (%)", "type" => "number", "required" => false]
        ]);
        
        $officeSchema = json_encode([
            ["name" => "department", "label" => "Department", "type" => "text", "required" => true],
            ["name" => "officer_name", "label" => "Officer Name", "type" => "text", "required" => true],
            ["name" => "open_time", "label" => "Open Time", "type" => "time", "required" => false],
            ["name" => "close_time", "label" => "Close Time", "type" => "time", "required" => false]
        ]);

        $stmt = $db->prepare("INSERT INTO gis_facility_types (name, icon_type, custom_fields_schema) VALUES (?, ?, ?)");
        $stmt->execute(['Public Toilet', 'restroom', $toiletSchema]);
        $stmt->execute(['Water Tank', 'tint', $waterTankSchema]);
        $stmt->execute(['Municipal Office', 'building', $officeSchema]);
        $stmt->execute(['Health Center', 'medkit', $defaultSchema]);
    }

    echo "<h1>GIS Module tables created successfully!</h1>";
} catch (Exception $e) {
    echo "<h1>Error creating GIS tables:</h1> <p>" . $e->getMessage() . "</p>";
}
