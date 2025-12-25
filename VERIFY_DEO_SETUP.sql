-- =========================================================
-- DIAGNOSTIC SCRIPT: Verify DEO Setup
-- Run this to check if everything is configured correctly
-- =========================================================

-- 1. Check if RLS is enabled on districts and hospitals
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('districts', 'hospitals')
ORDER BY tablename;

-- 2. List all RLS policies on districts
SELECT 
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'districts'
ORDER BY policyname;

-- 3. List all RLS policies on hospitals
SELECT 
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'hospitals'
ORDER BY policyname;

-- 4. Check your current user's profile and role
SELECT 
  id,
  auth_user_id,
  role,
  full_name,
  created_at
FROM profiles
WHERE auth_user_id = auth.uid();

-- 5. Count districts and hospitals
SELECT 
  'districts' as table_name,
  COUNT(*) as count
FROM districts
UNION ALL
SELECT 
  'hospitals' as table_name,
  COUNT(*) as count
FROM hospitals;

-- 6. Check if there are any data-entry-operator users
SELECT 
  id,
  auth_user_id,
  role,
  full_name
FROM profiles
WHERE role = 'data-entry-operator'
LIMIT 10;

-- 7. Test: Try to insert a test district (this will fail if RLS is blocking)
-- Uncomment to test:
-- INSERT INTO districts (name, created_by) 
-- VALUES ('Test District', auth.uid())
-- RETURNING *;

-- 8. Check districts table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'districts'
ORDER BY ordinal_position;

-- 9. Check hospitals table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'hospitals'
ORDER BY ordinal_position;
