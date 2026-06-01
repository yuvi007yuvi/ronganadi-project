<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($method !== 'POST') {
    jsonError(405, 'Method not allowed');
}

// Ensure the user is authenticated (Surveyor or Admin)
$user = requireAuth();

if (!isset($_FILES['file'])) {
    jsonError(400, 'No file uploaded');
}

$file = $_FILES['file'];

// Check for upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    jsonError(400, 'File upload failed with error code: ' . $file['error']);
}

// Validate file size (max 5MB just in case frontend compression fails)
if ($file['size'] > 5 * 1024 * 1024) {
    jsonError(400, 'File exceeds maximum size of 5MB');
}

// Validate file type
$allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
$file_info = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($file_info, $file['tmp_name']);
finfo_close($file_info);

if (!in_array($mime_type, $allowed_types)) {
    jsonError(400, 'Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.');
}

// Generate secure filename
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
// If extension doesn't match mime type securely, force it
if ($mime_type === 'image/jpeg') $extension = 'jpg';
else if ($mime_type === 'image/png') $extension = 'png';
else if ($mime_type === 'image/webp') $extension = 'webp';
else if ($mime_type === 'application/pdf') $extension = 'pdf';

$new_filename = uniqid('upload_') . '_' . time() . '.' . $extension;
$folder = isset($_GET['folder']) && $_GET['folder'] === 'profiles' ? 'profiles' : 'surveys';
$upload_dir = __DIR__ . '/uploads/' . $folder . '/';

if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$destination = $upload_dir . $new_filename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Generate the public URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'];
    
    // Calculate relative path from document root
    $base_dir = str_replace(basename($_SERVER['SCRIPT_NAME']), '', $_SERVER['SCRIPT_NAME']);
    $url = $protocol . $host . $base_dir . 'uploads/' . $folder . '/' . $new_filename;

    jsonResponse(['url' => $url, 'filename' => $new_filename], 201);
} else {
    jsonError(500, 'Failed to save uploaded file');
}
