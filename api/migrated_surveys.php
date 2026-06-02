<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDB();
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM migrated_surveys ORDER BY submitted_at DESC");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
    } 
    elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Basic validation
        $required = ['full_name', 'village', 'panchayat', 'permanent_address', 'voter_id', 'current_residence', 'occupation', 'monthly_salary', 'in_hand_salary', 'willing_to_return'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(["error" => "Missing required field: $field"]);
                exit;
            }
        }
        
        $sql = "INSERT INTO migrated_surveys 
                (full_name, village, panchayat, permanent_address, voter_id, current_residence, occupation, monthly_salary, in_hand_salary, willing_to_return, surveyor_name, remarks)
                VALUES 
                (:full_name, :village, :panchayat, :permanent_address, :voter_id, :current_residence, :occupation, :monthly_salary, :in_hand_salary, :willing_to_return, :surveyor_name, :remarks)";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':full_name' => $input['full_name'],
            ':village' => $input['village'],
            ':panchayat' => $input['panchayat'],
            ':permanent_address' => $input['permanent_address'],
            ':voter_id' => $input['voter_id'],
            ':current_residence' => $input['current_residence'],
            ':occupation' => $input['occupation'],
            ':monthly_salary' => $input['monthly_salary'],
            ':in_hand_salary' => $input['in_hand_salary'],
            ':willing_to_return' => $input['willing_to_return'],
            ':surveyor_name' => $input['surveyor_name'] ?? null,
            ':remarks' => $input['remarks'] ?? null
        ]);
        
        echo json_encode([
            "message" => "Survey submitted successfully",
            "id" => $pdo->lastInsertId()
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
