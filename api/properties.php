<?php
require_once 'config.php';
require_once 'middleware.php';

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verify JWT token
$token = getBearerToken();
if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$userId = verifyToken($token);
if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit();
}

try {
    $conn = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get user's properties
        $stmt = $conn->prepare("
            SELECT * FROM properties 
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$userId]);
        $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['properties' => $properties]);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Create new property
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['name']) || !isset($data['location']) || !isset($data['price'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit();
        }
        
        $stmt = $conn->prepare("
            INSERT INTO properties (
                user_id, name, location, price, status, 
                image_url, description, created_at
            ) VALUES (?, ?, ?, ?, 'active', ?, ?, NOW())
        ");
        $stmt->execute([
            $userId,
            $data['name'],
            $data['location'],
            $data['price'],
            $data['image_url'] ?? null,
            $data['description'] ?? null
        ]);
        
        $propertyId = $conn->lastInsertId();
        
        // Get the created property
        $stmt = $conn->prepare("SELECT * FROM properties WHERE id = ?");
        $stmt->execute([$propertyId]);
        $property = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['property' => $property]);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update property
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Property ID is required']);
            exit();
        }
        
        $updates = [];
        $params = [];
        
        if (isset($data['name'])) {
            $updates[] = "name = ?";
            $params[] = $data['name'];
        }
        if (isset($data['location'])) {
            $updates[] = "location = ?";
            $params[] = $data['location'];
        }
        if (isset($data['price'])) {
            $updates[] = "price = ?";
            $params[] = $data['price'];
        }
        if (isset($data['status'])) {
            $updates[] = "status = ?";
            $params[] = $data['status'];
        }
        if (isset($data['image_url'])) {
            $updates[] = "image_url = ?";
            $params[] = $data['image_url'];
        }
        if (isset($data['description'])) {
            $updates[] = "description = ?";
            $params[] = $data['description'];
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit();
        }
        
        $params[] = $data['id'];
        $params[] = $userId;
        
        $sql = "UPDATE properties SET " . implode(", ", $updates) . " WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Property not found']);
            exit();
        }
        
        // Get the updated property
        $stmt = $conn->prepare("SELECT * FROM properties WHERE id = ?");
        $stmt->execute([$data['id']]);
        $property = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['property' => $property]);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Delete property
        $propertyId = $_GET['id'] ?? null;
        
        if (!$propertyId) {
            http_response_code(400);
            echo json_encode(['error' => 'Property ID is required']);
            exit();
        }
        
        $stmt = $conn->prepare("DELETE FROM properties WHERE id = ? AND user_id = ?");
        $stmt->execute([$propertyId, $userId]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Property not found']);
            exit();
        }
        
        echo json_encode(['message' => 'Property deleted successfully']);
    }
} catch (Exception $e) {
    error_log('Properties API error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred while processing your request']);
} 