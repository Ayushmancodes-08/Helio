-- ====================================================
-- FIX SYSTEM-WIDE RLS (Profiles & Districts)
-- ====================================================

-- 1. FIX PROFILES READ ACCESS
-- The policy to check roles depends on reading the 'profiles' table.
-- If users cannot read their own profile, the role check fails.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile (Crucial for role checks)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth_user_id = auth.uid());

-- Allow authenticated users to read basic profile info (often needed for displaying names)
-- You can make this stricter if needed, but for now let's ensure it works.
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;
CREATE POLICY "Authenticated users can read all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);


-- 2. RE-APPLY DISTRICTS Insert Access (Data Entry Operator)
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

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

-- 3. RE-APPLY DISTRICTS Delete Access
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
