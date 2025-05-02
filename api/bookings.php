<?php
require_once 'config.php';
require_once 'middleware.php';

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

try {
    $conn = getDBConnection();
    
    switch ($method) {
        case 'GET':
            // Get user ID from token
            $userId = getUserIdFromToken();
            
            // Get bookings for the user
            $stmt = $conn->prepare("
                SELECT b.*, p.title, p.price_per_night, p.image_urls
                FROM bookings b
                JOIN properties p ON b.property_id = p.id
                WHERE b.user_id = ?
                ORDER BY b.created_at DESC
            ");
            $stmt->execute([$userId]);
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format the response
            $formattedBookings = array_map(function($booking) {
                return [
                    'id' => $booking['id'],
                    'property_id' => $booking['property_id'],
                    'property_title' => $booking['title'],
                    'property_image' => json_decode($booking['image_urls'])[0] ?? null,
                    'check_in' => $booking['check_in'],
                    'check_out' => $booking['check_out'],
                    'guests' => $booking['guests'],
                    'total_price' => $booking['total_price'],
                    'status' => $booking['status'],
                    'created_at' => $booking['created_at']
                ];
            }, $bookings);
            
            sendResponse(['bookings' => $formattedBookings]);
            break;
            
        case 'POST':
            // Get user ID from token
            $userId = getUserIdFromToken();
            
            // Get JSON data from request body
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['property_id']) || !isset($data['check_in']) || !isset($data['check_out']) || !isset($data['guests'])) {
                sendResponse(['error' => 'Missing required fields'], 400);
            }
            
            // Get property details
            $stmt = $conn->prepare("SELECT price_per_night FROM properties WHERE id = ?");
            $stmt->execute([$data['property_id']]);
            $property = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$property) {
                sendResponse(['error' => 'Property not found'], 404);
            }
            
            // Calculate total price
            $checkIn = new DateTime($data['check_in']);
            $checkOut = new DateTime($data['check_out']);
            $nights = $checkOut->diff($checkIn)->days;
            $totalPrice = $nights * $property['price_per_night'];
            
            // Create booking
            $stmt = $conn->prepare("
                INSERT INTO bookings (
                    user_id, property_id, check_in, check_out, 
                    guests, total_price, status
                ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
            ");
            
            $stmt->execute([
                $userId,
                $data['property_id'],
                $data['check_in'],
                $data['check_out'],
                $data['guests'],
                $totalPrice
            ]);
            
            $bookingId = $conn->lastInsertId();
            
            // Get the created booking
            $stmt = $conn->prepare("
                SELECT b.*, p.title, p.price_per_night, p.image_urls
                FROM bookings b
                JOIN properties p ON b.property_id = p.id
                WHERE b.id = ?
            ");
            $stmt->execute([$bookingId]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Format the response
            $formattedBooking = [
                'id' => $booking['id'],
                'property_id' => $booking['property_id'],
                'property_title' => $booking['title'],
                'property_image' => json_decode($booking['image_urls'])[0] ?? null,
                'check_in' => $booking['check_in'],
                'check_out' => $booking['check_out'],
                'guests' => $booking['guests'],
                'total_price' => $booking['total_price'],
                'status' => $booking['status'],
                'created_at' => $booking['created_at']
            ];
            
            sendResponse(['booking' => $formattedBooking]);
            break;
            
        case 'PUT':
            // Get user ID from token
            $userId = getUserIdFromToken();
            
            // Get booking ID from URL
            $bookingId = basename($_SERVER['REQUEST_URI']);
            
            // Get JSON data from request body
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['status'])) {
                sendResponse(['error' => 'Status is required'], 400);
            }
            
            // Update booking status
            $stmt = $conn->prepare("
                UPDATE bookings 
                SET status = ? 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$data['status'], $bookingId, $userId]);
            
            if ($stmt->rowCount() === 0) {
                sendResponse(['error' => 'Booking not found or unauthorized'], 404);
            }
            
            sendResponse(['message' => 'Booking updated successfully']);
            break;
            
        default:
            sendResponse(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
} 