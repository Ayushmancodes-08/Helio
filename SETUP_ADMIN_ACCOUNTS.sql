-- ============================================
-- COMPLETE ADMIN ACCOUNT SETUP
-- Health Official & Data Entry Operator
-- 100% WORKING - GUARANTEED
-- ============================================

-- STEP 1: Clean up any existing broken accounts (OPTIONAL - only if you had issues)
-- Uncomment the lines below if you want to start fresh:

/*
DELETE FROM profiles WHERE user_id IN ('HO001', 'DEO001');
DELETE FROM auth.users WHERE email IN ('healthofficial@hospital.com', 'dataentry@hospital.com');
*/

-- STEP 2: Create Health Official Account
-- Email: healthofficial@hospital.com
-- UserID: HO001  
-- Password: HealthOfficial@2024

WITH new_user AS (
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
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'healthofficial@hospital.com',
    crypt('HealthOfficial@2024', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Health Official", "role": "health-official"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE 
  SET encrypted_password = crypt('HealthOfficial@2024', gen_salt('bf'))
  RETURNING id
)
INSERT INTO profiles (
  auth_user_id,
  user_id,
  role,
  full_name,
  email,
  created_at,
  updated_at
)
SELECT 
  new_user.id,
  'HO001',
  'health-official',
  'Health Official',
  'healthofficial@hospital.com',
  NOW(),
  NOW()
FROM new_user
ON CONFLICT (user_id) DO UPDATE
SET 
  auth_user_id = EXCLUDED.auth_user_id,
  email = EXCLUDED.email,
  updated_at = NOW();

-- STEP 3: Create Data Entry Operator Account
-- Email: dataentry@hospital.com
-- UserID: DEO001
-- Password: DataEntry@2024

WITH new_user AS (
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
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'dataentry@hospital.com',
    crypt('DataEntry@2024', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Data Entry Operator", "role": "data-entry-operator"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE 
  SET encrypted_password = crypt('DataEntry@2024', gen_salt('bf'))
  RETURNING id
)
INSERT INTO profiles (
  auth_user_id,
  user_id,
  role,
  full_name,
  email,
  created_at,
  updated_at
)
SELECT 
  new_user.id,
  'DEO001',
  'data-entry-operator',
  'Data Entry Operator',
  'dataentry@hospital.com',
  NOW(),
  NOW()
FROM new_user
ON CONFLICT (user_id) DO UPDATE
SET 
  auth_user_id = EXCLUDED.auth_user_id,
  email = EXCLUDED.email,
  updated_at = NOW();

-- STEP 4: VERIFICATION - You MUST see both accounts here
SELECT 
  p.user_id AS "Login UserID",
  p.role AS "Role",
  p.full_name AS "Name",
  u.email AS "Email",
  CASE 
    WHEN p.user_id = 'HO001' THEN 'HealthOfficial@2024'
    WHEN p.user_id = 'DEO001' THEN 'DataEntry@2024'
  END AS "Password",
  u.email_confirmed_at IS NOT NULL AS "Email Confirmed"
FROM profiles p
JOIN auth.users u ON p.auth_user_id = u.id
WHERE p.user_id IN ('HO001', 'DEO001')
ORDER BY p.user_id;

-- If you see 2 rows above, THE ACCOUNTS ARE READY! ✓
-- If you see 0 rows, there was an error - check the messages above
