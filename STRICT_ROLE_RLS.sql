-- =========================================================
-- STRICT ROLE-BASED RLS FOR DISTRICTS & HOSPITALS
-- Only Data Entry Operators can manage data
-- =========================================================

-- ==========================================
-- 1. DISTRICTS TABLE
-- ==========================================

-- Enable RLS
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE to VIEW districts (safe, read-only)
DROP POLICY IF EXISTS "Anyone can view districts" ON districts;
CREATE POLICY "Anyone can view districts"
ON districts FOR SELECT
TO authenticated
USING (true);

-- Allow ONLY Data Entry Operators to INSERT
DROP POLICY IF EXISTS "Data Entry Operators can insert districts" ON districts;
CREATE POLICY "Data Entry Operators can insert districts"
ON districts FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role IN ('data_entry', 'data-entry-operator')
  )
);

-- Allow ONLY Data Entry Operators to UPDATE
DROP POLICY IF EXISTS "Data Entry Operators can update districts" ON districts;
CREATE POLICY "Data Entry Operators can update districts"
ON districts FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role IN ('data_entry', 'data-entry-operator')
  )
);

-- Allow ONLY Data Entry Operators to DELETE
DROP POLICY IF EXISTS "Data Entry Operators can delete districts" ON districts;
CREATE POLICY "Data Entry Operators can delete districts"
ON districts FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role IN ('data_entry', 'data-entry-operator')
  )
);

-- ==========================================
-- 2. HOSPITALS TABLE
-- ==========================================

-- Enable RLS
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE to VIEW hospitals (safe, read-only)
DROP POLICY IF EXISTS "Anyone can view hospitals" ON hospitals;
CREATE POLICY "Anyone can view hospitals"
ON hospitals FOR SELECT
TO authenticated
USING (true);

-- Allow Data Entry Operators AND Health Officials to manage
DROP POLICY IF EXISTS "Staff can manage hospitals" ON hospitals;
CREATE POLICY "Staff can manage hospitals"
ON hospitals FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role IN ('data_entry', 'data-entry-operator', 'health_official', 'health-official')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role IN ('data_entry', 'data-entry-operator', 'health_official', 'health-official')
  )
);

-- ==========================================
-- 3. VERIFICATION QUERIES
-- ==========================================

-- Check that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('districts', 'hospitals');

-- Check active policies
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('districts', 'hospitals')
ORDER BY tablename, policyname;

-- Check your current user's role (run this after login)
-- SELECT role FROM profiles WHERE auth_user_id = auth.uid();
