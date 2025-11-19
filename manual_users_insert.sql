-- Manual user insertion script - NO SUBQUERIES
-- Replace the UUID placeholders with actual UUIDs from Supabase Auth dashboard
-- Get UUIDs by running: SELECT id, email FROM auth.users WHERE email IN ('mhel7881@gmail.com', 'kcbiron79@gmail.com');

-- Borrower: email mhel7881@gmail.com
-- Replace 'borrower-uuid-here' with the actual UUID from auth.users
INSERT INTO users (id, full_name, phone, accepted_terms_at, terms_version)
VALUES ('borrower-uuid-here', 'Borrower User', NULL, NOW(), '1.0')
ON CONFLICT (id) DO NOTHING;

-- Get borrower role ID (assuming it exists from schema.sql)
-- Replace 'borrower-role-uuid-here' with actual role ID from roles table
INSERT INTO user_roles (user_id, role_id)
VALUES ('borrower-uuid-here', 'borrower-role-uuid-here')
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO borrower_profiles (user_id, employment_status, monthly_income)
VALUES ('borrower-uuid-here', 'employed', 5000.00)
ON CONFLICT (user_id) DO NOTHING;

-- Admin: email kcbiron79@gmail.com
-- Replace 'admin-uuid-here' with the actual UUID from auth.users
INSERT INTO users (id, full_name, phone, accepted_terms_at, terms_version)
VALUES ('admin-uuid-here', 'Admin User', NULL, NOW(), '1.0')
ON CONFLICT (id) DO NOTHING;

-- Replace 'admin-role-uuid-here' with actual admin role ID
INSERT INTO user_roles (user_id, role_id)
VALUES ('admin-uuid-here', 'admin-role-uuid-here')
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Note: No borrower profile for admin, as per original script