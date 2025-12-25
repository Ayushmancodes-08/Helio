-- ============================================
-- QUICK FIX: Create Admin Account Profiles
-- For users that already have auth accounts but no profiles
-- ============================================

-- Health Official (HO001)
-- If auth user exists but no profile, create profile
INSERT INTO profiles (
  auth_user_id,
  user_id,
  role,
  full_name,
  email
)
SELECT 
  u.id,
  'HO001',
  'health-official',
  'Health Official',
  u.email
FROM auth.users u
WHERE u.email = 'healthofficial@hospital.com'
  AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE auth_user_id = u.id
  )
ON CONFLICT (user_id) DO NOTHING;

-- Data Entry Operator (DEO001)
-- If auth user exists but no profile, create profile
INSERT INTO profiles (
  auth_user_id,
  user_id,
  role,
  full_name,
  email
)
SELECT 
  u.id,
  'DEO001',
  'data-entry-operator',
  'Data Entry Operator',
  u.email
FROM auth.users u
WHERE u.email = 'dataentry@hospital.com'
  AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE auth_user_id = u.id
  )
ON CONFLICT (user_id) DO NOTHING;

-- Verify both accounts
SELECT 
  p.user_id,
  p.role,
  p.full_name,
  p.email,
  'Login with UserID: ' || p.user_id as login_instruction
FROM profiles p
WHERE p.user_id IN ('HO001', 'DEO001')
ORDER BY p.user_id;

-- If you still don't see the accounts above, run this to check what exists:
SELECT 
  u.email,
  u.id as auth_user_id,
  p.user_id,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.auth_user_id
WHERE u.email IN ('healthofficial@hospital.com', 'dataentry@hospital.com');
