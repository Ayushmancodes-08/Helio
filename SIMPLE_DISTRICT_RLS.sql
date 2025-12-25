-- =========================================================
-- BALANCED SOLUTION: Simple RLS Policy That Works
-- =========================================================

-- Keep RLS ENABLED for security
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- 1. Allow EVERYONE to VIEW districts (safe, read-only)
DROP POLICY IF EXISTS "Anyone can view districts" ON districts;
CREATE POLICY "Anyone can view districts"
ON districts FOR SELECT
TO authenticated
USING (true);

-- 2. Allow INSERT/UPDATE/DELETE only for authenticated users
-- We'll check role in APPLICATION logic, not database
-- This prevents anonymous access while being permissive for logged-in users
DROP POLICY IF EXISTS "Authenticated users can manage districts" ON districts;
CREATE POLICY "Authenticated users can manage districts"
ON districts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ALTERNATIVE: If you want STRICT role checking, use this instead:
/*
DROP POLICY IF EXISTS "Only DEO can manage districts" ON districts;
CREATE POLICY "Only DEO can manage districts"
ON districts FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT auth_user_id FROM profiles 
    WHERE role IN ('data_entry', 'data-entry-operator', 'health_official')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT auth_user_id FROM profiles 
    WHERE role IN ('data_entry', 'data-entry-operator', 'health_official')
  )
);
*/

-- Verify
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'districts';
