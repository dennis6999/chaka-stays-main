<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

// Log the request
error_log('Google Auth Request: ' . file_get_contents('php://input'));

// Get the request body
$data = json_decode(file_get_contents('php://input'), true);
$token = $data['token'] ?? null;
$userInfo = $data['user_info'] ?? null;
$userType = $data['user_type'] ?? 'guest';

if (!$token || !$userInfo) {
    error_log('Missing token or user info');
    http_response_code(400);
    echo json_encode(['error' => 'Token and user info are required']);
    exit();
}

try {
    $email = $userInfo['email'];
    $name = $userInfo['name'] ?? '';
    $picture = $userInfo['picture'] ?? '';
    
    error_log('Processing user: ' . $email);
    
    // Get database connection
    $conn = getDBConnection();
    error_log('Database connection established');
    
    // Check if user exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        error_log('Creating new user: ' . $email);
        // Create new user with the correct table structure
        $stmt = $conn->prepare("INSERT INTO users (email, full_name, user_type, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$email, $name, $userType]);
        $userId = $conn->lastInsertId();
        error_log('New user created with ID: ' . $userId);
        
        // Create social login record
        $stmt = $conn->prepare("INSERT INTO social_logins (user_id, provider, provider_id, created_at) VALUES (?, 'google', ?, NOW())");
        $stmt->execute([$userId, $email]);
        error_log('Social login record created');
    } else {
        $userId = $user['id'];
        error_log('Existing user found with ID: ' . $userId);
        
        // Update user info
        $stmt = $conn->prepare("UPDATE users SET full_name = ? WHERE id = ?");
        $stmt->execute([$name, $userId]);
        error_log('User info updated');
        
        // Check if social login exists
        $stmt = $conn->prepare("SELECT * FROM social_logins WHERE user_id = ? AND provider = 'google'");
        $stmt->execute([$userId]);
        if (!$stmt->fetch()) {
            // Create social login record
            $stmt = $conn->prepare("INSERT INTO social_logins (user_id, provider, provider_id, created_at) VALUES (?, 'google', ?, NOW())");
            $stmt->execute([$userId, $email]);
            error_log('Social login record created for existing user');
        }
    }
    
    // Generate JWT token
    $jwt = generateToken($userId, $userType);
    error_log('JWT token generated');
    
    // Return success response
    echo json_encode([
        'message' => 'Authentication successful',
        'token' => $jwt,
        'user' => [
            'id' => $userId,
            'email' => $email,
            'name' => $name,
            'user_type' => $userType
        ]
    ]);
} catch (Exception $e) {
    error_log('Google auth error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['error' => 'Authentication failed. Please try again.']);
} 