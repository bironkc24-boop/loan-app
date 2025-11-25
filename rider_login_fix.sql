-- Fix Rider Login Access
-- After creating a rider, they can login with:

-- Email: [the email you entered, e.g., coronafrance7@gmail.com]
-- Password: [generated automatically, but you need to tell them]

-- To see rider login details (passwords are predictable based on email):
-- Format: [email-username]123! (truncated to 12 chars + ! if needed)

SELECT
    u.full_name,
    au.email,
    CASE
        WHEN length(split_part(au.email, '@', 1) || '123!') > 12
        THEN substring(split_part(au.email, '@', 1) || '123!' from 1 for 12) || '!'
        ELSE split_part(au.email, '@', 1) || '123!'
    END as password
FROM users u
JOIN auth.users au ON u.id = au.id
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'rider';

-- Current riders and their login info:
-- Run the above query to see rider emails and passwords