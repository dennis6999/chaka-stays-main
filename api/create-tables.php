<?php
require_once 'config.php';

try {
    $conn = getDBConnection();
    echo "Database connection successful\n";

    // Create users table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255),
        profile_picture VARCHAR(255),
        user_type ENUM('guest', 'host', 'admin') DEFAULT 'guest',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $conn->exec($sql);
    echo "Users table created successfully\n";

    // Create social_logins table
    $sql = "CREATE TABLE IF NOT EXISTS social_logins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        provider VARCHAR(50) NOT NULL,
        provider_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_provider (user_id, provider)
    )";
    $conn->exec($sql);
    echo "Social_logins table created successfully\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 