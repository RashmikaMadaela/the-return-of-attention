-- Create Admin User SQL Script
-- This script creates or updates a user to have admin role
-- Run this in your database console (Supabase SQL Editor, pgAdmin, etc.)

-- Option 1: Update an existing user to admin
-- Replace 'your-email@example.com' with the email of the user you want to make admin
UPDATE users 
SET role = 'admin', 
    "emailVerified" = NOW(),
    "isActive" = true
WHERE email = 'your-email@example.com';

-- Option 2: Create a new admin user (if needed)
-- Note: You'll need to register through the signup page first, then run Option 1
-- Or manually hash a password and insert it

-- To verify admin user was created:
SELECT id, email, name, role, "isActive", "emailVerified"
FROM users
WHERE role = 'admin';
