-- ============================================
-- FIX DATA ENTRY OPERATOR LOGIN
-- Run this script in the Supabase SQL Editor
-- ============================================

-- 1. Ensure RLS allows login lookup (Crucial!)
DROP POLICY IF EXISTS "Public can lookup user_id for auth" ON profiles;
CREATE POLICY "Public can lookup user_id for auth" ON profiles FOR SELECT USING (true);

-- 2. Clean up any broken/old entries for DEO001
DELETE FROM profiles WHERE user_id = 'DEO001';
DELETE FROM auth.users WHERE email = 'dataentry@hospital.com';

-- 3. Create the Auth User (The login implementation)
DO $$
DECLARE
  new_uid uuid := gen_random_uuid();
BEGIN
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
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_uid,
    'authenticated',
    'authenticated',
    'dataentry@hospital.com',
    crypt('DataEntry@2024', gen_salt('bf')), -- PASSWORD: DataEntry@2024
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Data Entry Operator"}',
    NOW(),
    NOW(),
    '',
    ''
  );

  -- 4. Create the Public Profile (The user_id lookup)
  INSERT INTO public.profiles (
    id,
    auth_user_id,
    user_id,
    role,
    full_name,
    email
  ) VALUES (
    gen_random_uuid(),
    new_uid,
    'DEO001',             -- USER ID: DEO001
    'data-entry-operator',
    'Data Entry Operator',
    'dataentry@hospital.com'
  );
  
  RAISE NOTICE '✅ Account Fixed: DEO001 / DataEntry@2024';
END $$;
