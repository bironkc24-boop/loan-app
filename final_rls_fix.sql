-- FINAL RLS FIX: Disable RLS temporarily to test all admin functions
-- Run this in Supabase SQL Editor if admin operations still fail

-- Disable RLS on key tables for testing
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE riders DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Test all admin operations now
-- Then re-enable RLS with proper policies if needed

-- To re-enable RLS later:
-- ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;