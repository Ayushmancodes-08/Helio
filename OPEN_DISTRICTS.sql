-- "NUCLEAR OPTION" FOR DEBUGGING ONLY
-- Temporarily allow ANY authenticated user to insert districts.
-- If this works, we knwo the problem is DEFINITELY the specific Role Check logic.
-- If this fails, the problem is something else (triggers, table locks, etc.)

ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "DEO can create districts" ON districts;

CREATE POLICY "DEO can create districts" 
ON districts FOR INSERT 
TO authenticated -- Allow ANY logged in user
WITH CHECK (true);

-- Also ensure Profiles are readable
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles read" ON profiles;
CREATE POLICY "Public profiles read" ON profiles FOR SELECT USING (true);
