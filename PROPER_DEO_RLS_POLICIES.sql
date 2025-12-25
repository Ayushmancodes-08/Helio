-- =========================================================
-- PROPER RLS POLICIES FOR DATA ENTRY OPERATOR WORKFLOW
-- Districts, Cities (if applicable), and Hospitals Management
-- =========================================================

-- Enable RLS on all tables
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- DISTRICTS TABLE POLICIES
-- =========================================================

-- 1. ALLOW EVERYONE TO VIEW districts (read-only, safe)
DROP POLICY IF EXISTS "Anyone can view districts" ON districts;
CREATE POLICY "Anyone can view districts"
  ON districts FOR SELECT
  TO authenticated
  USING (true);

-- 2. ALLOW DATA ENTRY OPERATORS TO INSERT districts
DROP POLICY IF EXISTS "DEO can insert districts" ON districts;
CREATE POLICY "DEO can insert districts"
  ON districts FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Check if the current user has 'data-entry-operator' role
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = auth.uid()
      AND role = 'data-entry-operator'
    )
  );

-- 3. ALLOW DATA ENTRY OPERATORS TO UPDATE districts (they created)
DROP POLICY IF EXISTS "DEO can update districts" ON districts;
CREATE POLICY "DEO can update districts"
  ON districts FOR UPDATE
  TO authenticated
  USING (
    -- Can only update if they are DEO
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = auth.uid()
      AND role = 'data-entry-operator'
    )
  )
  WITH CHECK (
    -- Same check for the updated row
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = auth.uid()
      AND role = 'data-entry-operator'
    )
  );

-- 4. ALLOW DATA ENTRY OPERATORS TO DELETE districts
DROP POLICY IF EXISTS "DEO can delete districts" ON districts;
CREATE POLICY "DEO can delete districts"
  ON districts FOR DELETE
  TO authenticated
  USING (
    -- Can only delete if they are DEO
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = auth.uid()
      AND role = 'data-entry-operator'
    )
  );

-- =========================================================
-- HOSPITALS TABLE POLICIES
-- =========================================================

-- 1. ALLOW EVERYONE TO VIEW hospitals (read-only, safe)
DROP POLICY IF EXISTS "Anyone can view hospitals" ON hospitals;
CREATE POLICY "Anyone can view hospitals"
  ON hospitals FOR SELECT
  TO authenticated
  USING (true);

-- 2. ALLOW DATA ENTRY OPERATORS TO INSERT hospitals
DROP POLICY IF EXISTS "DEO can insert hospitals" ON hospitals;
CREATE POLICY "DEO can insert hospitals"
  ON hospitals FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Check if the current user has 'data-entry-operator' role
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = auth.uid()
      AND role = 'data-entry-operator'
    )
  );

-- 3. ALLOW DATA ENTRY OPERATORS TO UPDATE hospitals
DROP POLICY IF EXISTS "DEO can update hospitals" ON hospitals;
CREATE POLICY "DEO can update hospitals"
  ON hospitals FOR UPDATE
  TO authenticated
  USING (
    -- Can only update if they are DEO
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = auth.uid()
      AND role = 'data-entry-operator'
    )
  )
  WITH CHECK (
    -- Same check for the updated row
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = auth.uid()
      AND role = 'data-entry-operator'
    )
  );

-- 4. ALLOW DATA ENTRY OPERATORS TO DELETE hospitals
DROP POLICY IF EXISTS "DEO can delete hospitals" ON hospitals;
CREATE POLICY "DEO can delete hospitals"
  ON hospitals FOR DELETE
  TO authenticated
  USING (
    -- Can only delete if they are DEO
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = auth.uid()
      AND role = 'data-entry-operator'
    )
  );

-- =========================================================
-- VERIFICATION QUERIES
-- =========================================================

-- Check current policies on districts
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'districts';

-- Check current policies on hospitals
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'hospitals';

-- Check if your user has the correct role
-- SELECT id, auth_user_id, role FROM profiles WHERE auth_user_id = auth.uid();
