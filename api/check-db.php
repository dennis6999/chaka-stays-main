<?php
require_once 'config.php';

try {
    $conn = getDBConnection();
    echo "Database connection successful\n";

    // Check if users table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "Users table exists\n";
    } else {
        echo "Users table does not exist\n";
    }

    // Check if social_logins table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'social_logins'");
    if ($stmt->rowCount() > 0) {
        echo "Social_logins table exists\n";
    } else {
        echo "Social_logins table does not exist\n";
    }

    // Show table structure
    echo "\nUsers table structure:\n";
    $stmt = $conn->query("DESCRIBE users");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "{$row['Field']} {$row['Type']}\n";
    }

    echo "\nSocial_logins table structure:\n";
    $stmt = $conn->query("DESCRIBE social_logins");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "{$row['Field']} {$row['Type']}\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 