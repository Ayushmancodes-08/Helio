-- ============================================
-- QUICK FIX: Create Profile for Existing User
-- ============================================
-- Run this if you already signed up but don't have a profile

-- This automatically creates a profile for the most recent auth user without a profile
INSERT INTO profiles (
  auth_user_id,
  role,
  full_name,
  phone,
  age,
  gender
)
SELECT 
  id,
  'patient' as role,
  COALESCE(raw_user_meta_data->>'full_name', 'Patient User') as full_name,
  phone,
  COALESCE((raw_user_meta_data->>'age')::integer, 25) as age,
  COALESCE(raw_user_meta_data->>'gender', 'other') as gender
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.auth_user_id = auth.users.id
)
ORDER BY created_at DESC
LIMIT 1;

-- Verify it was created
SELECT 
  p.full_name,
  p.phone,
  p.role,
  p.created_at,
  u.phone as auth_phone
FROM profiles p
JOIN auth.users u ON p.auth_user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
