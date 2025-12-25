-- =========================================================
-- NUCLEAR OPTION: Disable RLS Temporarily
-- Use this to test if RLS is causing the 500 error
-- =========================================================

-- Disable RLS on both tables
ALTER TABLE districts DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT 'RLS DISABLED' as status;
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('districts', 'hospitals');
