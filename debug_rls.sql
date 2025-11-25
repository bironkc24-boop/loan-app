-- Debug RLS Issues
-- Run this in Supabase SQL Editor to temporarily disable RLS for testing

-- Temporarily disable RLS on loans table
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;

-- Test query to see if data is accessible
SELECT COUNT(*) as loan_count FROM loans;

-- Check if there are any loans
SELECT id, borrower_id, status, applied_at FROM loans LIMIT 5;

-- Re-enable RLS after testing
-- ALTER TABLE loans ENABLE ROW LEVEL SECURITY;