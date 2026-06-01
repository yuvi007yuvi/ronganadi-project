<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$db = getDB();

// GET /api/citizens.php – List all (admin) or own (surveyor)
if ($method === 'GET') {
    $where = [];
    $params = [];



    // Filters
    if (!empty($_GET['area'])) { $where[] = 'area = ?'; $params[] = $_GET['area']; }
    if (!empty($_GET['caste'])) { $where[] = 'caste_category = ?'; $params[] = $_GET['caste']; }

    if (!empty($_GET['q'])) {
        $q = '%' . $_GET['q'] . '%';
        $where[] = '(full_name LIKE ? OR mobile LIKE ? OR voter_id_number LIKE ? OR address LIKE ?)';
        array_push($params, $q, $q, $q, $q);
    }

    $sql = 'SELECT * FROM citizens';
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY submitted_at DESC';

    // Pagination
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(100, intval($_GET['limit'] ?? 20));
    $offset = ($page - 1) * $limit;

    $countSql = str_replace('SELECT *', 'SELECT COUNT(*) as total', $sql);
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];

    $sql .= " LIMIT $limit OFFSET $offset";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    // Decode JSON arrays
    foreach ($rows as &$row) {
        $row['schemes_availed'] = json_decode($row['schemes_availed'] ?? '[]', true);
        $row['schemes_not_availed'] = json_decode($row['schemes_not_availed'] ?? '[]', true);
    }

    jsonResponse(['records' => $rows, 'total' => $total, 'page' => $page, 'limit' => $limit]);
}

// POST /api/citizens.php – Add record
if ($method === 'POST') {
    $data = getInput();
    $required = ['fullName', 'mobile', 'address', 'area', 'panchayat', 'voterIdNumber', 'casteCategory', 'occupation'];
    foreach ($required as $f) {
        if (empty($data[$f])) jsonError(400, "Field '$f' is required");
    }

    $stmt = $db->prepare('
        INSERT INTO citizens
        (full_name, mobile, address, area, panchayat, voter_id_number, pan_number, caste_category,
         occupation, schemes_availed, schemes_not_availed, remarks, surveyor_id, surveyor_name, is_migrated, submitted_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ');
    $stmt->execute([
        $data['fullName'], $data['mobile'], $data['address'], $data['area'], $data['panchayat'],
        $data['voterIdNumber'], $data['panNumber'] ?? '',
        $data['casteCategory'], $data['occupation'],
        json_encode($data['schemesAvailed'] ?? []),
        json_encode($data['schemesNotAvailed'] ?? []),
        $data['remarks'] ?? '',
        null, null, $data['is_migrated'] ?? 'no',
    ]);

    jsonResponse(['id' => $db->lastInsertId(), 'message' => 'Survey submitted successfully'], 201);
}

// PUT /api/citizens.php?id=X – Update record
if ($method === 'PUT') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'Record ID required');

    $data = getInput();
    
    // Check if it's a password reset
    if (isset($data['password']) && !empty($data['password'])) {
        $hash = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt = $db->prepare('UPDATE citizens SET password_hash=? WHERE id=?');
        $stmt->execute([$hash, $id]);
        jsonResponse(['message' => 'Password updated successfully']);
    }

    // Check if it's a status update
    if (isset($data['status']) && !empty($data['status'])) {
        $stmt = $db->prepare('UPDATE citizens SET status=? WHERE id=?');
        $stmt->execute([$data['status'], $id]);
        jsonResponse(['message' => 'Status updated successfully']);
    }

    $stmt = $db->prepare('
        UPDATE citizens SET
        full_name=?, mobile=?, address=?, area=?, panchayat=?, voter_id_number=?, pan_number=?,
        caste_category=?, occupation=?, schemes_availed=?, schemes_not_availed=?, remarks=?, is_migrated=?, updated_at=NOW()
        WHERE id=?
    ');
    $stmt->execute([
        $data['fullName'] ?? '', $data['mobile'] ?? '', $data['address'] ?? '', $data['area'] ?? '', $data['panchayat'] ?? '',
        $data['voterIdNumber'] ?? '', $data['panNumber'] ?? '',
        $data['casteCategory'] ?? '', $data['occupation'] ?? '',
        json_encode($data['schemesAvailed'] ?? []),
        json_encode($data['schemesNotAvailed'] ?? []),
        $data['remarks'] ?? '', $data['is_migrated'] ?? 'no', $id,
    ]);

    jsonResponse(['message' => 'Record updated']);
}

// DELETE /api/citizens.php?id=X
if ($method === 'DELETE') {
    requireAdmin();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) jsonError(400, 'Record ID required');
    $db->prepare('DELETE FROM citizens WHERE id = ?')->execute([$id]);
    jsonResponse(['message' => 'Record deleted']);
}

jsonError(405, 'Method not allowed');
