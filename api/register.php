<?php
// Enable CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

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
if (!isset($data['user_type']) || !in_array($data['user_type'], ['guest', 'owner'])) {
    sendResponse(['error' => 'Invalid user type'], 400);
}

if (!isset($data['email']) || !isValidEmail($data['email'])) {
    sendResponse(['error' => 'Invalid email'], 400);
}

if (!isset($data['password']) || strlen($data['password']) < 8) {
    sendResponse(['error' => 'Password must be at least 8 characters long'], 400);
}

if (!isset($data['phone']) || !isValidPhone($data['phone'])) {
    sendResponse(['error' => 'Invalid phone number'], 400);
}

// Validate fields based on user type
if ($data['user_type'] === 'guest') {
    if (!isset($data['full_name'])) {
        sendResponse(['error' => 'Full name is required'], 400);
    }
} else {
    if (!isset($data['business_name']) || !isset($data['owner_name']) || 
        !isset($data['business_email']) || !isset($data['business_phone'])) {
        sendResponse(['error' => 'All business details are required'], 400);
    }
    if (!isValidEmail($data['business_email'])) {
        sendResponse(['error' => 'Invalid business email'], 400);
    }
    if (!isValidPhone($data['business_phone'])) {
        sendResponse(['error' => 'Invalid business phone'], 400);
    }
}

try {
    $conn = getDBConnection();
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->rowCount() > 0) {
        sendResponse(['error' => 'Email already registered'], 400);
    }

    // Insert user data
    $stmt = $conn->prepare("
        INSERT INTO users (
            user_type, full_name, email, phone, password,
            business_name, owner_name, business_email, business_phone
        ) VALUES (
            :user_type, :full_name, :email, :phone, :password,
            :business_name, :owner_name, :business_email, :business_phone
        )
    ");

    $params = [
        ':user_type' => $data['user_type'],
        ':email' => $data['email'],
        ':phone' => $data['phone'],
        ':password' => hashPassword($data['password']),
        ':full_name' => $data['user_type'] === 'guest' ? $data['full_name'] : null,
        ':business_name' => $data['user_type'] === 'owner' ? $data['business_name'] : null,
        ':owner_name' => $data['user_type'] === 'owner' ? $data['owner_name'] : null,
        ':business_email' => $data['user_type'] === 'owner' ? $data['business_email'] : null,
        ':business_phone' => $data['user_type'] === 'owner' ? $data['business_phone'] : null
    ];

    $stmt->execute($params);
    $userId = $conn->lastInsertId();

    // Generate JWT token
    $token = generateToken($userId, $data['user_type']);

    // Return success response with token
    sendResponse([
        'message' => 'Registration successful',
        'token' => $token,
        'user' => [
            'id' => $userId,
            'user_type' => $data['user_type'],
            'email' => $data['email']
        ]
    ]);

} catch (PDOException $e) {
    sendResponse(['error' => 'Registration failed: ' . $e->getMessage()], 500);
} 