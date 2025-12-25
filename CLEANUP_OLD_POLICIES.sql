-- =========================================================
-- CLEANUP: Remove ALL old policies (clean slate)
-- Run this FIRST before applying new policies
-- =========================================================

-- Drop ALL policies on districts
DROP POLICY IF EXISTS "Anyone can view districts" ON districts;
DROP POLICY IF EXISTS "Public can view districts" ON districts;
DROP POLICY IF EXISTS "Public read districts" ON districts;
DROP POLICY IF EXISTS "Staff manage districts" ON districts;
DROP POLICY IF EXISTS "Data Entry Operators can manage districts" ON districts;
DROP POLICY IF EXISTS "Authenticated users can manage districts" ON districts;
DROP POLICY IF EXISTS "Only DEO can manage districts" ON districts;
DROP POLICY IF EXISTS "DEO can create districts" ON districts;
DROP POLICY IF EXISTS "DEO can insert districts" ON districts;
DROP POLICY IF EXISTS "DEO can update districts" ON districts;
DROP POLICY IF EXISTS "DEO can delete districts" ON districts;
DROP POLICY IF EXISTS "Data Entry Operators can insert districts" ON districts;
DROP POLICY IF EXISTS "Data Entry Operators can update districts" ON districts;
DROP POLICY IF EXISTS "Data Entry Operators can delete districts" ON districts;

-- Drop ALL policies on hospitals
DROP POLICY IF EXISTS "Anyone can view hospitals" ON hospitals;
DROP POLICY IF EXISTS "Public can view hospitals" ON hospitals;
DROP POLICY IF EXISTS "Public read hospitals" ON hospitals;
DROP POLICY IF EXISTS "Staff manage hospitals" ON hospitals;
DROP POLICY IF EXISTS "Staff can manage hospitals" ON hospitals;
DROP POLICY IF EXISTS "Data Entry Operators and Health Officials to INSERT/UPDATE/DELETE" ON hospitals;
DROP POLICY IF EXISTS "Data Entry Operators can manage hospitals" ON hospitals;
DROP POLICY IF EXISTS "Authenticated users can manage hospitals" ON hospitals;
DROP POLICY IF EXISTS "DEO can insert hospitals" ON hospitals;
DROP POLICY IF EXISTS "DEO can update hospitals" ON hospitals;
DROP POLICY IF EXISTS "DEO can delete hospitals" ON hospitals;

-- Verify all policies are gone
SELECT 'CLEANUP COMPLETE' as status;
SELECT 'Districts Policies Remaining:' as check_name, COUNT(*) as count FROM pg_policies WHERE tablename = 'districts';
SELECT 'Hospitals Policies Remaining:' as check_name, COUNT(*) as count FROM pg_policies WHERE tablename = 'hospitals';
