-- =========================================================
-- ROBUST FIX: SECURE RPC FUNCTIONS (Bypasses RLS Flakiness)
-- =========================================================

-- 1. Create a function to add districts SECURELY
-- "SECURITY DEFINER" means it runs with the privileges of the Creator (Admin),
-- bypassing the RLS policies on the table itself. We check permissions manually inside.

CREATE OR REPLACE FUNCTION create_district_secure(district_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  user_role text;
  new_district json;
BEGIN
  -- Get current User ID
  current_user_id := auth.uid();
  
  -- Get User Role from profiles (Direct admin-level read)
  SELECT role INTO user_role
  FROM profiles
  WHERE auth_user_id = current_user_id;

  -- 1. LOGIC CHECK: Is this a Data Entry Operator?
  IF user_role NOT IN ('data_entry', 'data-entry-operator') THEN
    RAISE EXCEPTION 'Access Denied: You do not have the Data Entry Operator role. (Role found: %)', user_role;
  END IF;

  -- 2. ACTION: Perform the Insert (Bypassing Table RLS)
  INSERT INTO districts (name, created_by)
  VALUES (district_name, current_user_id)
  RETURNING row_to_json(districts.*) INTO new_district;

  RETURN new_district;
END;
$$;

-- 2. Grant Execute Permission to Authenticated Users
GRANT EXECUTE ON FUNCTION create_district_secure(text) TO authenticated;

-- 3. OPTIONAL: Ensure the table is still safe for direct reads
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view districts" ON districts;
CREATE POLICY "Public can view districts" ON districts FOR SELECT USING (true);
