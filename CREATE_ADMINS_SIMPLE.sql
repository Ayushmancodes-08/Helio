-- ============================================
-- SIMPLE ADMIN ACCOUNT CREATOR
-- Works 100% - No Complex SQL
-- ============================================

-- STEP 1: Delete existing accounts (if any)
DELETE FROM profiles WHERE user_id IN ('HO001', 'DEO001');
DELETE FROM auth.users WHERE email IN ('healthofficial@hospital.com', 'dataentry@hospital.com');

-- STEP 2: Create Health Official
DO $$
DECLARE
  new_auth_id uuid;
BEGIN
  -- Create auth user
  new_auth_id := gen_random_uuid();
  
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_auth_id,
    'authenticated',
    'authenticated',
    'healthofficial@hospital.com',
    crypt('HealthOfficial@2024', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Health Official"}',
    NOW(),
    NOW()
  );
  
  -- Create profile
  INSERT INTO profiles (
    auth_user_id,
    user_id,
    role,
    full_name,
    email
  ) VALUES (
    new_auth_id,
    'HO001',
    'health-official',
    'Health Official',
    'healthofficial@hospital.com'
  );
  
  RAISE NOTICE 'Health Official created: HO001';
END $$;

-- STEP 3: Create Data Entry Operator
DO $$
DECLARE
  new_auth_id uuid;
BEGIN
  -- Create auth user
  new_auth_id := gen_random_uuid();
  
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_auth_id,
    'authenticated',
    'authenticated',
    'dataentry@hospital.com',
    crypt('DataEntry@2024', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Data Entry Operator"}',
    NOW(),
    NOW()
  );
  
  -- Create profile
  INSERT INTO profiles (
    auth_user_id,
    user_id,
    role,
    full_name,
    email
  ) VALUES (
    new_auth_id,
    'DEO001',
    'data-entry-operator',
    'Data Entry Operator',
    'dataentry@hospital.com'
  );
  
  RAISE NOTICE 'Data Entry Operator created: DEO001';
END $$;

-- STEP 4: VERIFY - Must show 2 accounts
SELECT 
  p.user_id AS "UserID",
  p.role AS "Role",
  p.full_name AS "Name",
  u.email AS "Email",
  CASE 
    WHEN p.user_id = 'HO001' THEN 'HealthOfficial@2024'
    WHEN p.user_id = 'DEO001' THEN 'DataEntry@2024'
  END AS "Password"
FROM profiles p
JOIN auth.users u ON p.auth_user_id = u.id
WHERE p.user_id IN ('HO001', 'DEO001')
ORDER BY p.user_id;

-- ✅ SUCCESS if you see 2 rows above!
