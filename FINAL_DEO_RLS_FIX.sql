-- =========================================================
-- FINAL FIX: Complete DEO RLS Setup (Clean)
-- Run this AFTER CLEANUP_OLD_POLICIES.sql
-- =========================================================

-- Step 1: Ensure your user has the correct role
UPDATE profiles 
SET role = 'data-entry-operator'
WHERE auth_user_id = auth.uid()
AND role IS NULL;

-- Step 2: Enable RLS
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Step 3: Create CLEAN policies for DISTRICTS (4 total)
CREATE POLICY "Districts: View" ON districts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Districts: Create" ON districts FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

CREATE POLICY "Districts: Update" ON districts FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

CREATE POLICY "Districts: Delete" ON districts FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

-- Step 4: Create CLEAN policies for HOSPITALS (4 total)
CREATE POLICY "Hospitals: View" ON hospitals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Hospitals: Create" ON hospitals FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

CREATE POLICY "Hospitals: Update" ON hospitals FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

CREATE POLICY "Hospitals: Delete" ON hospitals FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

-- Step 5: Verify everything
SELECT '✅ SETUP COMPLETE' as status;
SELECT '✅ Your Role:' as check_name, role FROM profiles WHERE auth_user_id = auth.uid();
SELECT '✅ Districts RLS:' as check_name, rowsecurity FROM pg_tables WHERE tablename = 'districts';
SELECT '✅ Hospitals RLS:' as check_name, rowsecurity FROM pg_tables WHERE tablename = 'hospitals';
SELECT '✅ Districts Policies:' as check_name, COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'districts';
SELECT '✅ Hospitals Policies:' as check_name, COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'hospitals';
