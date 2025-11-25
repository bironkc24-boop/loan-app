-- Fix Admin Role Assignment
-- Run this in your Supabase SQL Editor

INSERT INTO user_roles (user_id, role_id)
SELECT
    'c58197aa-663d-4a56-be66-31762fd5a023',
    (SELECT id FROM roles WHERE name = 'admin')
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Verify the assignment (email is in auth.users table)
SELECT
    au.email,
    u.full_name,
    r.name as role_name
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE au.id = 'c58197aa-663d-4a56-be66-31762fd5a023';