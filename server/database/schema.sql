-- Blood Bank Management System Database Schema
-- Updated with full user registration fields

-- Create database
CREATE DATABASE IF NOT EXISTS blood_bank;
USE blood_bank;

-- Drop existing tables to recreate with new schema
DROP TABLE IF EXISTS blood_inventory;
DROP TABLE IF EXISTS blood_requests;
DROP TABLE IF EXISTS donors;
DROP TABLE IF EXISTS blood_banks;
DROP TABLE IF EXISTS users;

-- Users table with full registration fields
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    name VARCHAR(255),
    age INT,
    phone VARCHAR(20),
    blood_type VARCHAR(5),
    state VARCHAR(100),
    district VARCHAR(100),
    city_village VARCHAR(200),
    location VARCHAR(500),
    avatar_url TEXT,
    avatar_data LONGBLOB,
    role ENUM('user', 'admin', 'donor') DEFAULT 'user',
    google_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(6),
    otp_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Donors table (users who register as donors)
CREATE TABLE donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    age INT,
    state VARCHAR(100),
    district VARCHAR(100),
    city_village VARCHAR(200),
    last_donation DATE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Blood Banks table
CREATE TABLE blood_banks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    phone VARCHAR(20),
    email VARCHAR(255),
    hours VARCHAR(50) DEFAULT '24/7',
    state VARCHAR(100),
    district VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blood Inventory table
CREATE TABLE blood_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bank_id INT,
    blood_type VARCHAR(5) NOT NULL,
    units INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_id) REFERENCES blood_banks(id) ON DELETE CASCADE
);

-- Blood Requests table
CREATE TABLE blood_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    patient_name VARCHAR(255) NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    units_needed INT DEFAULT 1,
    hospital VARCHAR(255),
    location VARCHAR(500),
    urgency ENUM('normal', 'urgent', 'critical') DEFAULT 'normal',
    urgency_note TEXT,
    state VARCHAR(100),
    district VARCHAR(100),
    status ENUM('pending', 'fulfilled', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert Admin user (password: 250621 - will be hashed in app)
-- Using bcrypt hash for '250621'
INSERT INTO users (username, email, password, name, firstname, lastname, role, email_verified) VALUES
('admin', 'admin@bloodbank.com', '$2b$10$rKN3vVG1tU5KLBjM.9YQp.8.5j5w5S7dHNvQg5HFflnpx8qPy3/Hy', 'Administrator', 'Admin', 'User', 'admin', TRUE);

-- Insert sample blood bank (real data, no mock donors)
INSERT INTO blood_banks (name, location, phone, hours, state, district) VALUES
('Central Blood Bank', 'Chennai, Tamil Nadu', '044-25361234', '24/7', 'Tamil Nadu', 'Chennai'),
('Apollo Blood Center', 'Bangalore, Karnataka', '080-26301234', '8am - 10pm', 'Karnataka', 'Bangalore Urban');

-- Insert initial blood inventory for banks
INSERT INTO blood_inventory (bank_id, blood_type, units) VALUES
(1, 'A+', 0), (1, 'A-', 0), (1, 'B+', 0), (1, 'B-', 0),
(1, 'AB+', 0), (1, 'AB-', 0), (1, 'O+', 0), (1, 'O-', 0),
(2, 'A+', 0), (2, 'A-', 0), (2, 'B+', 0), (2, 'B-', 0),
(2, 'AB+', 0), (2, 'AB-', 0), (2, 'O+', 0), (2, 'O-', 0);
