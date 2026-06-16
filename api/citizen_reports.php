<?php
require_once __DIR__ . '/config.php';

setCorsHeaders();
$user = requireAuth();
$db = getDB();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all records
    try {
        $stmt = $db->query("SELECT * FROM citizen_reports ORDER BY created_at DESC");
        $records = $stmt->fetchAll();
        jsonResponse($records);
    } catch (PDOException $e) {
        jsonError(500, "Failed to fetch reports: " . $e->getMessage());
    }
} elseif ($method === 'POST') {
    // Add single or bulk records
    $data = getInput();
    
    if (isset($data['bulk']) && is_array($data['records'])) {
        // Bulk insert
        try {
            $db->beginTransaction();
            $stmt = $db->prepare("INSERT INTO citizen_reports (
                timestamp, name, father_husband_name, guardian_name, village_address, caste, religion,
                family_above_18, family_below_18, booth_no_name, panchayat, police_station, district,
                pin_code, aadhaar_no, voter_id, pan, ration_card_no, disability_uid, bank_account_no,
                branch_name, ifsc, mobile_no, alternate_no, schemes_applied, schemes_included, help_done
            ) VALUES (
                :timestamp, :name, :father_husband_name, :guardian_name, :village_address, :caste, :religion,
                :family_above_18, :family_below_18, :booth_no_name, :panchayat, :police_station, :district,
                :pin_code, :aadhaar_no, :voter_id, :pan, :ration_card_no, :disability_uid, :bank_account_no,
                :branch_name, :ifsc, :mobile_no, :alternate_no, :schemes_applied, :schemes_included, :help_done
            )");
            
            $count = 0;
            foreach ($data['records'] as $r) {
                // Formatting values or fallback to null/empty string
                $stmt->execute([
                    ':timestamp' => $r['timestamp'] ?? date('Y-m-d H:i:s'),
                    ':name' => $r['name'] ?? '',
                    ':father_husband_name' => $r['father_husband_name'] ?? '',
                    ':guardian_name' => $r['guardian_name'] ?? '',
                    ':village_address' => $r['village_address'] ?? '',
                    ':caste' => $r['caste'] ?? '',
                    ':religion' => $r['religion'] ?? '',
                    ':family_above_18' => (int)($r['family_above_18'] ?? 0),
                    ':family_below_18' => (int)($r['family_below_18'] ?? 0),
                    ':booth_no_name' => $r['booth_no_name'] ?? '',
                    ':panchayat' => $r['panchayat'] ?? '',
                    ':police_station' => $r['police_station'] ?? '',
                    ':district' => $r['district'] ?? '',
                    ':pin_code' => $r['pin_code'] ?? '',
                    ':aadhaar_no' => $r['aadhaar_no'] ?? '',
                    ':voter_id' => $r['voter_id'] ?? '',
                    ':pan' => $r['pan'] ?? '',
                    ':ration_card_no' => $r['ration_card_no'] ?? '',
                    ':disability_uid' => $r['disability_uid'] ?? '',
                    ':bank_account_no' => $r['bank_account_no'] ?? '',
                    ':branch_name' => $r['branch_name'] ?? '',
                    ':ifsc' => $r['ifsc'] ?? '',
                    ':mobile_no' => $r['mobile_no'] ?? '',
                    ':alternate_no' => $r['alternate_no'] ?? '',
                    ':schemes_applied' => $r['schemes_applied'] ?? '',
                    ':schemes_included' => $r['schemes_included'] ?? '',
                    ':help_done' => $r['help_done'] ?? ''
                ]);
                $count++;
            }
            $db->commit();
            jsonResponse(["message" => "Successfully inserted $count records", "count" => $count]);
        } catch (PDOException $e) {
            $db->rollBack();
            jsonError(500, "Bulk insert failed: " . $e->getMessage());
        }
    } else {
        // Single insert
        try {
            $stmt = $db->prepare("INSERT INTO citizen_reports (
                timestamp, name, father_husband_name, guardian_name, village_address, caste, religion,
                family_above_18, family_below_18, booth_no_name, panchayat, police_station, district,
                pin_code, aadhaar_no, voter_id, pan, ration_card_no, disability_uid, bank_account_no,
                branch_name, ifsc, mobile_no, alternate_no, schemes_applied, schemes_included, help_done
            ) VALUES (
                :timestamp, :name, :father_husband_name, :guardian_name, :village_address, :caste, :religion,
                :family_above_18, :family_below_18, :booth_no_name, :panchayat, :police_station, :district,
                :pin_code, :aadhaar_no, :voter_id, :pan, :ration_card_no, :disability_uid, :bank_account_no,
                :branch_name, :ifsc, :mobile_no, :alternate_no, :schemes_applied, :schemes_included, :help_done
            )");
            
            $stmt->execute([
                ':timestamp' => $data['timestamp'] ?? date('Y-m-d H:i:s'),
                ':name' => $data['name'] ?? '',
                ':father_husband_name' => $data['father_husband_name'] ?? '',
                ':guardian_name' => $data['guardian_name'] ?? '',
                ':village_address' => $data['village_address'] ?? '',
                ':caste' => $data['caste'] ?? '',
                ':religion' => $data['religion'] ?? '',
                ':family_above_18' => (int)($data['family_above_18'] ?? 0),
                ':family_below_18' => (int)($data['family_below_18'] ?? 0),
                ':booth_no_name' => $data['booth_no_name'] ?? '',
                ':panchayat' => $data['panchayat'] ?? '',
                ':police_station' => $data['police_station'] ?? '',
                ':district' => $data['district'] ?? '',
                ':pin_code' => $data['pin_code'] ?? '',
                ':aadhaar_no' => $data['aadhaar_no'] ?? '',
                ':voter_id' => $data['voter_id'] ?? '',
                ':pan' => $data['pan'] ?? '',
                ':ration_card_no' => $data['ration_card_no'] ?? '',
                ':disability_uid' => $data['disability_uid'] ?? '',
                ':bank_account_no' => $data['bank_account_no'] ?? '',
                ':branch_name' => $data['branch_name'] ?? '',
                ':ifsc' => $data['ifsc'] ?? '',
                ':mobile_no' => $data['mobile_no'] ?? '',
                ':alternate_no' => $data['alternate_no'] ?? '',
                ':schemes_applied' => $data['schemes_applied'] ?? '',
                ':schemes_included' => $data['schemes_included'] ?? '',
                ':help_done' => $data['help_done'] ?? ''
            ]);
            jsonResponse(["message" => "Record inserted successfully"]);
        } catch (PDOException $e) {
            jsonError(500, "Failed to insert record: " . $e->getMessage());
        }
    }
} elseif ($method === 'DELETE') {
    // Delete a record
    $id = $_GET['id'] ?? null;
    if (!$id) jsonError(400, "ID is required");
    
    try {
        $stmt = $db->prepare("DELETE FROM citizen_reports WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(["message" => "Record deleted"]);
    } catch (PDOException $e) {
        jsonError(500, "Failed to delete record: " . $e->getMessage());
    }
} else {
    jsonError(405, "Method not allowed");
}
