-- Diagnostic script to check if auth users exist and get their UUIDs
-- Run this first to verify the emails are in auth.users

-- Check if the required emails exist in auth.users
SELECT id, email, created_at
FROM auth.users
WHERE email IN ('mhel7881@gmail.com', 'kcbiron79@gmail.com');

-- Check if roles exist
SELECT id, name
FROM roles
WHERE name IN ('borrower', 'admin');

-- If the above queries return the expected users and roles,
-- use the UUIDs from the first query in the manual insert script below