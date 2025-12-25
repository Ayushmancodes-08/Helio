-- =========================================================
-- PROPER FIX: After disabling RLS, apply clean policies
-- Run this AFTER NUCLEAR_OPTION_DISABLE_RLS.sql
-- =========================================================

-- Step 1: Update your user role
UPDATE profiles 
SET role = 'data-entry-operator'
WHERE auth_user_id = auth.uid()
AND role IS NULL;

-- Step 2: Enable RLS fresh
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Step 3: Create ONLY 4 policies for DISTRICTS
CREATE POLICY "deo_districts_select" ON districts FOR SELECT TO authenticated USING (true);
CREATE POLICY "deo_districts_insert" ON districts FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));
CREATE POLICY "deo_districts_update" ON districts FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));
CREATE POLICY "deo_districts_delete" ON districts FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

-- Step 4: Create ONLY 4 policies for HOSPITALS
CREATE POLICY "deo_hospitals_select" ON hospitals FOR SELECT TO authenticated USING (true);
CREATE POLICY "deo_hospitals_insert" ON hospitals FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));
CREATE POLICY "deo_hospitals_update" ON hospitals FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));
CREATE POLICY "deo_hospitals_delete" ON hospitals FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

-- Step 5: Verify
SELECT '✅ SETUP COMPLETE' as status;
SELECT role FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
SELECT COUNT(*) as districts_policies FROM pg_policies WHERE tablename = 'districts';
SELECT COUNT(*) as hospitals_policies FROM pg_policies WHERE tablename = 'hospitals';
