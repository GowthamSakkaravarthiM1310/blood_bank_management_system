-- Migration: Add user_type and blood_bank_id columns to users table
-- Run this migration to enable user role separation

-- Add user_type column (normal = regular user, blood_bank = blood bank manager)
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type ENUM('normal', 'blood_bank') DEFAULT 'normal';

-- Add blood_bank_id column for blood bank users to associate with their bank
ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_bank_id INT DEFAULT NULL;

-- Add foreign key constraint (if blood_banks table exists)
-- ALTER TABLE users ADD CONSTRAINT fk_user_blood_bank FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id) ON DELETE SET NULL;

-- Update existing users to be normal type (they should already be 'normal' due to default)
UPDATE users SET user_type = 'normal' WHERE user_type IS NULL;
