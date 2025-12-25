-- ============================================
-- ADMIN LOGIN TROUBLESHOOTING
-- Run these queries to diagnose login issues
-- ============================================

-- STEP 1: Check if auth users exist
SELECT 
  email,
  id as auth_user_id,
  created_at,
  email_confirmed_at,
  encrypted_password IS NOT NULL as has_password
FROM auth.users
WHERE email IN ('healthofficial@hospital.com', 'dataentry@hospital.com')
ORDER BY email;

-- STEP 2: Check if profiles exist
SELECT 
  user_id,
  role,
  full_name,
  email,
  auth_user_id
FROM profiles
WHERE user_id IN ('HO001', 'DEO001')
ORDER BY user_id;

-- STEP 3: Check the connection between auth and profiles
SELECT 
  u.email as auth_email,
  u.id as auth_user_id,
  p.user_id as profile_user_id,
  p.role,
  p.full_name,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.auth_user_id
WHERE u.email IN ('healthofficial@hospital.com', 'dataentry@hospital.com')
ORDER BY u.email;

-- STEP 4: If NO results above, create the accounts manually
-- Copy the ENTIRE block below and run it separately

-- CREATE HEALTH OFFICIAL
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
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'healthofficial@hospital.com',
  crypt('healthofficial123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Health Official"}',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'healthofficial@hospital.com'
)
RETURNING id;

-- CREATE DATA ENTRY OPERATOR  
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
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'dataentry@hospital.com',
  crypt('dataentry123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Data Entry Operator"}',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'dataentry@hospital.com'
)
RETURNING id;

-- STEP 5: After creating auth users, create their profiles
INSERT INTO profiles (auth_user_id, user_id, role, full_name, email)
SELECT 
  u.id,
  'HO001',
  'health-official',
  'Health Official',
  'healthofficial@hospital.com'
FROM auth.users u
WHERE u.email = 'healthofficial@hospital.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = 'HO001')
ON CONFLICT (auth_user_id) DO NOTHING;

INSERT INTO profiles (auth_user_id, user_id, role, full_name, email)
SELECT 
  u.id,
  'DEO001',
  'data-entry-operator',
  'Data Entry Operator',
  'dataentry@hospital.com'
FROM auth.users u
WHERE u.email = 'dataentry@hospital.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = 'DEO001')
ON CONFLICT (auth_user_id) DO NOTHING;

-- STEP 6: Final verification - you should see both accounts
SELECT 
  p.user_id,
  p.role,
  p.full_name,
  u.email,
  'UserID: ' || p.user_id || ' | Password: healthofficial123 or dataentry123' as credentials
FROM profiles p
JOIN auth.users u ON p.auth_user_id = u.id
WHERE p.user_id IN ('HO001', 'DEO001')
ORDER BY p.user_id;
