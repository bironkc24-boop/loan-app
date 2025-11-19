-- =============================================
-- DEFAULT USERS BOOTSTRAP
-- =============================================
-- Run this script AFTER creating the auth users in Supabase Auth with the provided emails and passwords.
-- This ensures auth.users exists before attempting insertions.

-- Borrower: email mhel7881@gmail.com, password mhel123
INSERT INTO users (id, full_name, phone, accepted_terms_at, terms_version)
SELECT id, 'Borrower User', NULL, NOW(), '1.0' FROM auth.users WHERE email = 'mhel7881@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM auth.users u JOIN roles r ON r.name = 'borrower' WHERE u.email = 'mhel7881@gmail.com'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO borrower_profiles (user_id, employment_status, monthly_income)
SELECT id, 'employed', 5000.00 FROM auth.users WHERE email = 'mhel7881@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Admin: email kcbiron79@gmail.com, password almonte17
INSERT INTO users (id, full_name, phone, accepted_terms_at, terms_version)
SELECT id, 'Admin User', NULL, NOW(), '1.0' FROM auth.users WHERE email = 'kcbiron79@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM auth.users u JOIN roles r ON r.name = 'admin' WHERE u.email = 'kcbiron79@gmail.com'
ON CONFLICT (user_id, role_id) DO NOTHING;