<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

// Get JSON data from request body
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['email']) || !isset($data['password'])) {
    sendResponse(['error' => 'Email and password are required'], 400);
}

try {
    $conn = getDBConnection();
    
    // Get user by email
    $stmt = $conn->prepare("
        SELECT id, user_type, email, password, full_name, business_name, profile_picture
        FROM users 
        WHERE email = ?
    ");
    $stmt->execute([$data['email']]);
    
    if ($stmt->rowCount() === 0) {
        sendResponse(['error' => 'Invalid email or password'], 401);
    }
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verify password
    if (!verifyPassword($data['password'], $user['password'])) {
        sendResponse(['error' => 'Invalid email or password'], 401);
    }
    
    // Generate JWT token
    $token = generateToken($user['id'], $user['user_type']);
    
    // Return success response with token
    sendResponse([
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'user_type' => $user['user_type'],
            'email' => $user['email'],
            'name' => $user['user_type'] === 'guest' ? $user['full_name'] : $user['business_name'],
            'picture' => $user['profile_picture'] ?? 'https://ui-avatars.com/api/?name=' . urlencode($user['user_type'] === 'guest' ? $user['full_name'] : $user['business_name'])
        ]
    ]);
    
} catch (PDOException $e) {
    sendResponse(['error' => 'Login failed: ' . $e->getMessage()], 500);
} 