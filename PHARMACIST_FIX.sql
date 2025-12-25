-- ============================================
-- CREATE PROFILE FOR PHARMACIST USER
-- Run this in Supabase SQL Editor if your pharmacist
-- profile is not showing in the sidebar
-- ============================================

-- Step 1: Find your pharmacist user in auth.users
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users  
WHERE email LIKE '%pharmacist%' OR email LIKE '%pharm%'
ORDER BY created_at DESC;

-- Step 2: Create profile (Replace YOUR_EMAIL and YOUR_USER_ID with values from above)
-- IMPORTANT: Replace the values in the INSERT statement below

INSERT INTO profiles (
  auth_user_id,
  user_id,
  role,
  full_name,
  email,
  license_number,
  specialization
) VALUES (
  'YOUR_AUTH_USER_ID_HERE',  -- Copy from Step 1 query result
  'PHAR001',  -- Custom pharmacist ID
  'pharmacist',
  'Pharmacist Name',  -- Your name
  'YOUR_EMAIL_HERE',  -- Your email from Step 1
  'PL123456',  -- Your pharmacy license number
  'General Pharmacy'  -- Specialization
);

-- Step 3: Verify it was created
SELECT * FROM profiles WHERE role = 'pharmacist' ORDER BY created_at DESC;

-- ============================================
-- QUICK FIX: Auto-create for MOST RECENT user
-- ============================================
-- If you just signed up, this will automatically create your profile

INSERT INTO profiles (
  auth_user_id,
  role,
  full_name,
  email,
  user_id,
  license_number
)
SELECT 
  id,
  'pharmacist' as role,
  COALESCE(raw_user_meta_data->>'full_name', 'Pharmacist User') as full_name,
  email,
  COALESCE(raw_user_meta_data->>'user_id', 'PHAR' || LPAD(CAST(FLOOR(RANDOM() * 1000) AS TEXT), 3, '0')) as user_id,
  COALESCE(raw_user_meta_data->>'license_number', 'PL000000') as license_number
FROM auth.users
WHERE email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE profiles.auth_user_id = auth.users.id
  )
ORDER BY created_at DESC
LIMIT 1;

-- Verify
SELECT 
  p.full_name,
  p.email,
  p.role,
  p.user_id,
  p.license_number
FROM profiles p
WHERE p.role = 'pharmacist'
ORDER BY p.created_at DESC;
