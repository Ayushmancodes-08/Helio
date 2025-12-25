-- =========================================================
-- QUICK FIX: One-Click Solution for DEO RLS Issues
-- Run this entire script in Supabase SQL Editor
-- =========================================================

-- Step 1: Ensure your user has the correct role
UPDATE profiles 
SET role = 'data-entry-operator'
WHERE auth_user_id = auth.uid()
AND role IS NULL;

-- Step 2: Enable RLS
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop old policies (clean slate)
DROP POLICY IF EXISTS "Anyone can view districts" ON districts;
DROP POLICY IF EXISTS "DEO can insert districts" ON districts;
DROP POLICY IF EXISTS "DEO can update districts" ON districts;
DROP POLICY IF EXISTS "DEO can delete districts" ON districts;
DROP POLICY IF EXISTS "Anyone can view hospitals" ON hospitals;
DROP POLICY IF EXISTS "DEO can insert hospitals" ON hospitals;
DROP POLICY IF EXISTS "DEO can update hospitals" ON hospitals;
DROP POLICY IF EXISTS "DEO can delete hospitals" ON hospitals;

-- Step 4: Create new policies for DISTRICTS
CREATE POLICY "Anyone can view districts" ON districts FOR SELECT TO authenticated USING (true);

CREATE POLICY "DEO can insert districts" ON districts FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

CREATE POLICY "DEO can update districts" ON districts FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

CREATE POLICY "DEO can delete districts" ON districts FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

-- Step 5: Create new policies for HOSPITALS
CREATE POLICY "Anyone can view hospitals" ON hospitals FOR SELECT TO authenticated USING (true);

CREATE POLICY "DEO can insert hospitals" ON hospitals FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

CREATE POLICY "DEO can update hospitals" ON hospitals FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

CREATE POLICY "DEO can delete hospitals" ON hospitals FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

-- Step 6: Verify everything
SELECT 'VERIFICATION RESULTS' as status;
SELECT '✅ Your Role:' as check_name, role FROM profiles WHERE auth_user_id = auth.uid();
SELECT '✅ Districts RLS Enabled:' as check_name, rowsecurity FROM pg_tables WHERE tablename = 'districts';
SELECT '✅ Hospitals RLS Enabled:' as check_name, rowsecurity FROM pg_tables WHERE tablename = 'hospitals';
SELECT '✅ Districts Policies:' as check_name, COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'districts';
SELECT '✅ Hospitals Policies:' as check_name, COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'hospitals';
