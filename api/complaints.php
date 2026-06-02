<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$db = getDB();

if ($method === 'GET') {
    $id = intval($_GET['id'] ?? 0);
    $ticketId = $_GET['ticket_id'] ?? '';

    if ($id > 0) {
        // Return single complaint with timeline
        $stmt = $db->prepare("
            SELECT c.*, d.name as department_name, o.name as officer_name, o.mobile as officer_mobile
            FROM grievance_complaints c
            LEFT JOIN grievance_departments d ON c.department_id = d.id
            LEFT JOIN grievance_officers o ON c.assigned_officer_id = o.id
            WHERE c.id = ? LIMIT 1
        ");
        $stmt->execute([$id]);
        $complaint = $stmt->fetch();

        if (!$complaint) {
            jsonError(404, 'Complaint not found');
        }

        // Authorization check: Citizen can only see their own complaint
        if ($user['role'] === 'citizen' && intval($complaint['citizen_id']) !== intval($user['id'])) {
            jsonError(403, 'Unauthorized access to complaint');
        }

        // Get timeline
        $tStmt = $db->prepare("SELECT * FROM grievance_timeline WHERE complaint_id = ? ORDER BY created_at ASC");
        $tStmt->execute([$id]);
        $complaint['timeline'] = $tStmt->fetchAll();

        jsonResponse($complaint);
    } elseif (!empty($ticketId)) {
        // Return single complaint by ticket ID
        $stmt = $db->prepare("
            SELECT c.*, d.name as department_name, o.name as officer_name, o.mobile as officer_mobile
            FROM grievance_complaints c
            LEFT JOIN grievance_departments d ON c.department_id = d.id
            LEFT JOIN grievance_officers o ON c.assigned_officer_id = o.id
            WHERE c.ticket_id = ? LIMIT 1
        ");
        $stmt->execute([$ticketId]);
        $complaint = $stmt->fetch();

        if (!$complaint) {
            jsonError(404, 'Ticket not found');
        }

        // Get timeline
        $tStmt = $db->prepare("SELECT * FROM grievance_timeline WHERE complaint_id = ? ORDER BY created_at ASC");
        $tStmt->execute([$complaint['id']]);
        $complaint['timeline'] = $tStmt->fetchAll();

        jsonResponse($complaint);
    } else {
        // Return list of complaints
        if ($user['role'] === 'admin') {
            $stmt = $db->query("
                SELECT c.*, d.name as department_name, o.name as officer_name, o.mobile as officer_mobile
                FROM grievance_complaints c
                LEFT JOIN grievance_departments d ON c.department_id = d.id
                LEFT JOIN grievance_officers o ON c.assigned_officer_id = o.id
                ORDER BY c.submitted_at DESC
            ");
            jsonResponse($stmt->fetchAll());
        } else {
            // Citizen - only their own complaints
            $stmt = $db->prepare("
                SELECT c.*, d.name as department_name, o.name as officer_name, o.mobile as officer_mobile
                FROM grievance_complaints c
                LEFT JOIN grievance_departments d ON c.department_id = d.id
                LEFT JOIN grievance_officers o ON c.assigned_officer_id = o.id
                WHERE c.citizen_id = ?
                ORDER BY c.submitted_at DESC
            ");
            $stmt->execute([$user['id']]);
            jsonResponse($stmt->fetchAll());
        }
    }
}

if ($method === 'POST') {
    // Citizen Lodging a Complaint (Stage 1: Awaiting Admin Review)
    $data = getInput();
    
    if (empty($data['title']) || empty($data['category']) || empty($data['address']) || empty($data['description']) || empty($data['contact_number'])) {
        jsonError(400, 'Title, category, address, description, and contact number are required');
    }

    try {
        $db->beginTransaction();

        // 1. Initial status is 'submitted' (No ticket ID, no department/officer assigned yet)
        $priority = in_array($data['priority'] ?? '', ['low', 'medium', 'high', 'emergency']) ? $data['priority'] : 'medium';

        // 2. Insert complaint
        $stmt = $db->prepare("
            INSERT INTO grievance_complaints 
            (ticket_id, citizen_id, title, category, sub_category, department_id, priority, location_lat, location_lng, address, description, photo_url, video_url, contact_number, status, assigned_officer_id, expected_completion_date, progress, ward, submitted_at)
            VALUES (NULL, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', NULL, NULL, 0, ?, NOW())
        ");
        
        $stmt->execute([
            $user['id'],
            $data['title'],
            $data['category'],
            $data['sub_category'] ?? '',
            $priority,
            $data['location_lat'] ?? null,
            $data['location_lng'] ?? null,
            $data['address'],
            $data['description'],
            $data['photo_url'] ?? null,
            $data['video_url'] ?? null,
            $data['contact_number'],
            $data['ward'] ?? 'Ward 01'
        ]);

        $complaintId = $db->lastInsertId();

        // 3. Add initial timeline item: Submitted
        $timelineStmt = $db->prepare("INSERT INTO grievance_timeline (complaint_id, status_event, event_description, created_at) VALUES (?, ?, ?, NOW())");
        $timelineStmt->execute([$complaintId, 'Complaint Submitted', 'Citizen registered the complaint details. Awaiting admin review and ticket generation.']);

        $db->commit();
        jsonResponse(['id' => $complaintId, 'status' => 'submitted', 'message' => 'Complaint logged successfully. Admin will review and generate a ticket soon.'], 201);

    } catch (Exception $e) {
        $db->rollBack();
        jsonError(500, 'Error: ' . $e->getMessage());
    }
}

if ($method === 'PUT') {
    // Admin review, ticket generation, department assignment, and status updates
    requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'Complaint ID is required');

    $data = getInput();

    try {
        $db->beginTransaction();

        // Fetch original complaint
        $origStmt = $db->prepare("SELECT * FROM grievance_complaints WHERE id = ? LIMIT 1");
        $origStmt->execute([$id]);
        $original = $origStmt->fetch();

        if (!$original) {
            jsonError(404, 'Complaint not found');
        }

        // Check if we need to raise a ticket (ticket_id is NULL, and we are assigning a department/officer)
        $ticketId = $original['ticket_id'];
        $ticketJustGenerated = false;

        $officerId = array_key_exists('assigned_officer_id', $data) && $data['assigned_officer_id'] !== '' ? ($data['assigned_officer_id'] === null ? null : intval($data['assigned_officer_id'])) : $original['assigned_officer_id'];
        $departmentId = array_key_exists('department_id', $data) && $data['department_id'] !== '' ? ($data['department_id'] === null ? null : intval($data['department_id'])) : $original['department_id'];

        // Auto-assign department if officer is assigned
        if ($officerId && $officerId !== $original['assigned_officer_id']) {
            $deptQuery = $db->prepare("SELECT department_id FROM grievance_officers WHERE id = ? LIMIT 1");
            $deptQuery->execute([$officerId]);
            $oDept = $deptQuery->fetch();
            if ($oDept) {
                $departmentId = intval($oDept['department_id']);
            }
        }

        // Generate Ticket ID if not already present
        if (empty($ticketId) && ($officerId || $departmentId)) {
            $ticketId = 'GRV-' . date('Y') . '-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
            $ticketJustGenerated = true;
        }

        // Auto status transitions based on assignments
        if ($ticketJustGenerated) {
            $status = 'ticket_generated';
        }
        
        if ($departmentId && $status === 'ticket_generated') {
            $status = 'dept_assigned';
        }
        
        if ($officerId && ($status === 'ticket_generated' || $status === 'dept_assigned')) {
            $status = 'officer_assigned';
        }

        // If explicitly requested, override auto status
        $status = $data['status'] ?? $status;

        $progress = isset($data['progress']) ? intval($data['progress']) : intval($original['progress']);
        $expectedDate = $data['expected_completion_date'] ?? $original['expected_completion_date'];
        if (empty($expectedDate) && $ticketJustGenerated) {
            // Set 5 days SLA default
            $expectedDate = date('Y-m-d', strtotime('+5 days'));
        }

        $priority = $data['priority'] ?? $original['priority'];

        if ($ticketJustGenerated) {
            // Update database with ticket_generated_at
            $stmt = $db->prepare("
                UPDATE grievance_complaints 
                SET ticket_id = ?, ticket_generated_at = NOW(), status = ?, progress = ?, assigned_officer_id = ?, department_id = ?, expected_completion_date = ?, priority = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $ticketId,
                $status,
                $progress,
                $officerId,
                $departmentId,
                $expectedDate,
                $priority,
                $id
            ]);
        } else {
            // Update database without touching ticket_generated_at
            $stmt = $db->prepare("
                UPDATE grievance_complaints 
                SET ticket_id = ?, status = ?, progress = ?, assigned_officer_id = ?, department_id = ?, expected_completion_date = ?, priority = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $ticketId,
                $status,
                $progress,
                $officerId,
                $departmentId,
                $expectedDate,
                $priority,
                $id
            ]);
        }

        $timelineStmt = $db->prepare("INSERT INTO grievance_timeline (complaint_id, status_event, event_description, created_at) VALUES (?, ?, ?, NOW())");

        // Add timeline updates
        if ($ticketJustGenerated) {
            $timelineStmt->execute([$id, 'Ticket Generated', "Admin reviewed the complaint and raised Ticket ID: $ticketId"]);
            if ($departmentId) {
                $timelineStmt->execute([$id, 'Assigned To Department', 'Grievance routed to the respective department.']);
            }
            if ($officerId) {
                $timelineStmt->execute([$id, 'Assigned To Engineer', 'Grievance assigned to the execution engineer.']);
            }
            
            // Fetch names for Notification
            $deptName = 'Assigned Department';
            $offName = 'Assigned Officer';
            $offMobile = 'N/A';

            if ($officerId) {
                $infoStmt = $db->prepare("
                    SELECT d.name as dept_name, o.name as off_name, o.mobile as off_mobile 
                    FROM grievance_departments d 
                    JOIN grievance_officers o ON o.department_id = d.id 
                    WHERE o.id = ? LIMIT 1
                ");
                $infoStmt->execute([$officerId]);
                $info = $infoStmt->fetch();
                if ($info) {
                    $deptName = $info['dept_name'];
                    $offName = $info['off_name'];
                    $offMobile = $info['off_mobile'];
                }
            } elseif ($departmentId) {
                $deptStmt = $db->prepare("SELECT name FROM grievance_departments WHERE id = ? LIMIT 1");
                $deptStmt->execute([$departmentId]);
                $deptInfo = $deptStmt->fetch();
                if ($deptInfo) {
                    $deptName = $deptInfo['name'];
                }
            }

            // Insert notification for the Citizen!
            $notifMsg = "Your complaint '{$original['title']}' has been reviewed. Ticket #$ticketId has been generated and assigned to the $deptName" . ($officerId ? " under Engineer $offName (Contact: $offMobile)" : "") . ". You can now track it online.";
            $notifStmt = $db->prepare("
                INSERT INTO grievance_notifications (citizen_id, complaint_id, ticket_id, message, is_read, created_at) 
                VALUES (?, ?, ?, ?, 0, NOW())
            ");
            $notifStmt->execute([$original['citizen_id'], $id, $ticketId, $notifMsg]);
        } else {
            // General Status changes
            if ($status !== $original['status']) {
                $statusLabels = [
                    'submitted' => 'Complaint Logged',
                    'ticket_generated' => 'Ticket Generated',
                    'dept_assigned' => 'Assigned To Department',
                    'officer_assigned' => 'Assigned To Engineer',
                    'action_taken' => 'Action Taken',
                    'ground_inspection' => 'Ground Inspection',
                    'completed' => 'Work Completed'
                ];
                $statusDescs = [
                    'submitted' => 'Complaint re-logged and put under review.',
                    'ticket_generated' => 'Ticket generated by administration.',
                    'dept_assigned' => 'Routed and assigned to department.',
                    'officer_assigned' => 'Assigned to the execution engineer.',
                    'action_taken' => 'Initial action has been taken by the engineer.',
                    'ground_inspection' => 'On-site ground inspection is being conducted.',
                    'completed' => 'Grievance resolved and verified.'
                ];
                $eventTitle = $statusLabels[$status] ?? 'Status Updated';
                $eventDesc = $statusDescs[$status] ?? "Ticket status updated to {$status}.";
                $timelineStmt->execute([$id, $eventTitle, $eventDesc]);

                // Notify citizen about status change!
                $notifMsg = "Status Update for Ticket #{$ticketId}: The ticket status has been updated to '{$eventTitle}'.";
                $notifStmt = $db->prepare("
                    INSERT INTO grievance_notifications (citizen_id, complaint_id, ticket_id, message, is_read, created_at) 
                    VALUES (?, ?, ?, ?, 0, NOW())
                ");
                $notifStmt->execute([$original['citizen_id'], $id, $ticketId, $notifMsg]);
            }

            // Check for admin remarks (Status Update Modal)
            if (!empty($data['admin_remark'])) {
                $eventTitle = !empty($data['action_taken']) ? 'Action Taken: ' . $data['action_taken'] : 'Admin Status Update';
                $timelineStmt->execute([$id, $eventTitle, $data['admin_remark']]);
                
                // Notify citizen
                $notifMsg = "Admin Update on Ticket #$ticketId: " . $data['admin_remark'];
                $notifStmt = $db->prepare("
                    INSERT INTO grievance_notifications (citizen_id, complaint_id, ticket_id, message, is_read, created_at) 
                    VALUES (?, ?, ?, ?, 0, NOW())
                ");
                $notifStmt->execute([$original['citizen_id'], $id, $ticketId, $notifMsg]);
            }

            // Log inspection progress milestones
            if ($progress >= 50 && $original['progress'] < 50) {
                $timelineStmt->execute([$id, 'Site Inspection Completed', 'Inspection engineer completed field study and measurements.']);
            }
        }

        $db->commit();
        jsonResponse(['message' => 'Complaint updated successfully', 'ticket_id' => $ticketId]);

    } catch (Exception $e) {
        $db->rollBack();
        jsonError(500, 'Error: ' . $e->getMessage());
    }
}

jsonError(405, 'Method not allowed');
