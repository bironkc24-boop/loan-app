-- Temporary fix for RLS issues
-- Run this in Supabase SQL Editor

-- Temporarily allow all authenticated users to view loans (for testing)
DROP POLICY IF EXISTS "Admins can view all loans" ON loans;
CREATE POLICY "All authenticated users can view loans"
    ON loans FOR SELECT
    TO authenticated
    USING (true);

-- Test if this fixes the issue
-- Then we can restore the proper admin-only policy