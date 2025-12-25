-- ============================================
-- FINAL FIX: Clean Everything First
-- Then create fresh accounts
-- ============================================

-- STEP 1: Complete cleanup - removes EVERYTHING
DO $$
BEGIN
  -- Delete profiles first (child records)
  DELETE FROM profiles WHERE email IN ('healthofficial@hospital.com', 'dataentry@hospital.com');
  DELETE FROM profiles WHERE user_id IN ('HO001', 'DEO001');
  
  -- Delete auth users (parent records)
  DELETE FROM auth.users WHERE email IN ('healthofficial@hospital.com', 'dataentry@hospital.com');
  
  RAISE NOTICE 'Old accounts deleted';
END $$;

-- STEP 2: Create Health Official
DO $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated',
    'healthofficial@hospital.com', crypt('HealthOfficial@2024', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}', 
    '{"full_name": "Health Official"}', NOW(), NOW()
  );
  
  INSERT INTO profiles (auth_user_id, user_id, role, full_name, email)
  VALUES (new_id, 'HO001', 'health-official', 'Health Official', 'healthofficial@hospital.com');
  
  RAISE NOTICE 'Health Official created: HO001';
END $$;

-- STEP 3: Create Data Entry Operator
DO $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated',
    'dataentry@hospital.com', crypt('DataEntry@2024', gen_salt('bf')),
    NOW(), '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Data Entry Operator"}', NOW(), NOW()
  );
  
  INSERT INTO profiles (auth_user_id, user_id, role, full_name, email)
  VALUES (new_id, 'DEO001', 'data-entry-operator', 'Data Entry Operator', 'dataentry@hospital.com');
  
  RAISE NOTICE 'Data Entry Operator created: DEO001';
END $$;

-- VERIFY: Must show exactly 2 rows
SELECT 
  p.user_id, p.role, p.full_name, u.email,
  CASE WHEN p.user_id = 'HO001' THEN 'HealthOfficial@2024'
       WHEN p.user_id = 'DEO001' THEN 'DataEntry@2024' END AS password
FROM profiles p
JOIN auth.users u ON p.auth_user_id = u.id
WHERE p.user_id IN ('HO001', 'DEO001')
ORDER BY p.user_id;
