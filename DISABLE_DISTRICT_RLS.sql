-- =========================================================
-- COMPLETE FIX: DISABLE RLS ON DISTRICTS
-- This is the nuclear option for internal admin tools
-- =========================================================

-- 1. DISABLE RLS entirely on districts table
ALTER TABLE districts DISABLE ROW LEVEL SECURITY;

-- 2. For safety, keep RLS enabled but create a permissive policy
-- Comment out line above and uncomment below if you want RLS enabled

-- ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all for authenticated" ON districts;
-- CREATE POLICY "Allow all for authenticated" 
-- ON districts FOR ALL 
-- TO authenticated
-- USING (true)
-- WITH CHECK (true);

-- 3. Verify the change
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'districts';
