-- FIX RLS FOR DISTRICTS AND HOSPITALS

-- ==========================================
-- 1. DISTRICTS TABLE POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE to VIEW districts
DROP POLICY IF EXISTS "Public can view districts" ON districts;
CREATE POLICY "Public can view districts" 
ON districts FOR SELECT 
USING (true);

-- Allow DATA ENTRY OPERATORS to INSERT (Create) districts
DROP POLICY IF EXISTS "DEO can create districts" ON districts;
CREATE POLICY "DEO can create districts" 
ON districts FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE auth_user_id = auth.uid() 
    AND role = 'data_entry'
  )
);

-- Allow DATA ENTRY OPERATORS to DELETE districts
DROP POLICY IF EXISTS "DEO can delete districts" ON districts;
CREATE POLICY "DEO can delete districts" 
ON districts FOR DELETE 
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE auth_user_id = auth.uid() 
    AND role = 'data_entry'
  )
);

-- ==========================================
-- 2. HOSPITALS TABLE POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE to VIEW hospitals
DROP POLICY IF EXISTS "Public can view hospitals" ON hospitals;
CREATE POLICY "Public can view hospitals" 
ON hospitals FOR SELECT 
USING (true);

-- Allow DATA ENTRY OPERATORS and HEALTH OFFICIALS to INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Staff can manage hospitals" ON hospitals;
CREATE POLICY "Staff can manage hospitals" 
ON hospitals FOR ALL 
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('data_entry', 'health_official')
  )
);
