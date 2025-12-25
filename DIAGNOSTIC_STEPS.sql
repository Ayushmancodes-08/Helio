-- =========================================================
-- STEP-BY-STEP DIAGNOSTIC: Run these IN ORDER
-- =========================================================

-- STEP 1: Check if RLS is currently enabled on districts
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'districts';
-- Expected: rowsecurity = true

-- STEP 2: Check what policies currently exist
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'districts';
-- This shows you ALL current policies

-- STEP 3: Check your current login and role
-- (This only works if you're logged into the app, not as Postgres admin)
SELECT 
  auth.uid() as my_user_id,
  (SELECT role FROM profiles WHERE auth_user_id = auth.uid()) as my_role,
  (SELECT email FROM profiles WHERE auth_user_id = auth.uid()) as my_email;
-- Expected: my_role should be 'data_entry' or 'data-entry-operator'

-- STEP 4: Check if your user exists in profiles table
SELECT COUNT(*) as user_count, role 
FROM profiles 
WHERE role IN ('data_entry', 'data-entry-operator')
GROUP BY role;
-- Expected: At least 1 row

-- STEP 5: TEMPORARY DEBUG - Remove ALL policies (we'll add them back)
DROP POLICY IF EXISTS "Anyone can view districts" ON districts;
DROP POLICY IF EXISTS "Authenticated users can manage districts" ON districts;
DROP POLICY IF EXISTS "Data Entry Operators can insert districts" ON districts;
DROP POLICY IF EXISTS "Data Entry Operators can update districts" ON districts;
DROP POLICY IF EXISTS "Data Entry Operators can delete districts" ON districts;

-- STEP 6: Create ULTRA-SIMPLE policy for testing
CREATE POLICY "temp_allow_all"
ON districts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- STEP 7: Verify the new policy is active
SELECT policyname FROM pg_policies WHERE tablename = 'districts';
-- Expected: Only 'temp_allow_all' should be listed

-- =========================================================
-- After running this, TRY ADDING A DISTRICT in your app
-- If it WORKS now, the problem was the role-checking logic
-- If it STILL FAILS, there's something else wrong
-- =========================================================
