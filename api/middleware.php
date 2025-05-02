<?php
require_once 'config.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function verifyToken($token) {
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        return $decoded->user_id;
    } catch (Exception $e) {
        return null;
    }
}

function getUserIdFromToken() {
    $token = getBearerToken();
    if (!$token) {
        sendResponse(['error' => 'Unauthorized'], 401);
    }
    
    $userId = verifyToken($token);
    if (!$userId) {
        sendResponse(['error' => 'Invalid token'], 401);
    }
    
    return $userId;
}

function generateToken($userId) {
    $issuedAt = time();
    $expirationTime = $issuedAt + 3600; // Token valid for 1 hour
    
    $payload = array(
        'user_id' => $userId,
        'iat' => $issuedAt,
        'exp' => $expirationTime
    );
    
    return JWT::encode($payload, JWT_SECRET, 'HS256');
}

function authenticate() {
    $headers = getallheaders();
    
    // Check for Authorization header
    if (!isset($headers['Authorization'])) {
        sendResponse(['error' => 'Authorization header is required'], 401);
    }
    
    // Extract token from header
    $authHeader = $headers['Authorization'];
    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        sendResponse(['error' => 'Invalid authorization header format'], 401);
    }
    
    $token = $matches[1];
    
    try {
        // Verify token
        $decoded = verifyToken($token);
        
        // Get user from database
        $conn = getDBConnection();
        $stmt = $conn->prepare("
            SELECT id, user_type, email, full_name, business_name
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$decoded->userId]);
        
        if ($stmt->rowCount() === 0) {
            sendResponse(['error' => 'User not found'], 401);
        }
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Return user data
        return [
            'id' => $user['id'],
            'user_type' => $user['user_type'],
            'email' => $user['email'],
            'name' => $user['user_type'] === 'guest' ? $user['full_name'] : $user['business_name']
        ];
        
    } catch (Exception $e) {
        sendResponse(['error' => 'Invalid token'], 401);
    }
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
} 