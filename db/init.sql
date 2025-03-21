-- Initialize database
CREATE DATABASE IF NOT EXISTS school_management;
USE school_management;

-- Create tables
CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO schools (name, address, latitude, longitude) VALUES
('Central High School', '123 Main St', 51.5074, -0.1278),
('North Elementary', '456 Park Ave', 51.5214, -0.1419),
('West Middle School', '789 Oak Rd', 51.4975, -0.1357),
('South Academy', '321 Pine St', 51.4937, -0.1207);
