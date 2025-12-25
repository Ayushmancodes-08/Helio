-- ============================================
-- CREATE ADMIN ACCOUNTS (Health Official & Data Entry Operator)
-- Run this script in Supabase SQL Editor
-- It will only create accounts if they don't already exist
-- ============================================

-- HEALTH OFFICIAL ACCOUNT
-- UserID: HO001
-- Password: healthofficial123
DO $$
DECLARE
  v_user_id uuid;
  v_existing_profile_count int;
BEGIN
  -- Check if profile already exists
  SELECT COUNT(*) INTO v_existing_profile_count
  FROM profiles
  WHERE user_id = 'HO001';

  -- Only create if doesn't exist
  IF v_existing_profile_count = 0 THEN
    -- Create auth user
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
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
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
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO v_user_id;

    -- Create profile
    INSERT INTO profiles (
      auth_user_id,
      user_id,
      role,
      full_name,
      email
    ) VALUES (
      v_user_id,
      'HO001',
      'health-official',
      'Health Official',
      'healthofficial@hospital.com'
    );

    RAISE NOTICE 'Health Official account created successfully (HO001)';
  ELSE
    RAISE NOTICE 'Health Official account already exists (HO001)';
  END IF;
END $$;

-- DATA ENTRY OPERATOR ACCOUNT
-- UserID: DEO001
-- Password: dataentry123
DO $$
DECLARE
  v_user_id uuid;
  v_existing_profile_count int;
BEGIN
  -- Check if profile already exists
  SELECT COUNT(*) INTO v_existing_profile_count
  FROM profiles
  WHERE user_id = 'DEO001';

  -- Only create if doesn't exist
  IF v_existing_profile_count = 0 THEN
    -- Create auth user
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
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
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
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO v_user_id;

    -- Create profile
    INSERT INTO profiles (
      auth_user_id,
      user_id,
      role,
      full_name,
      email
    ) VALUES (
      v_user_id,
      'DEO001',
      'data-entry-operator',
      'Data Entry Operator',
      'dataentry@hospital.com'
    );

    RAISE NOTICE 'Data Entry Operator account created successfully (DEO001)';
  ELSE
    RAISE NOTICE 'Data Entry Operator account already exists (DEO001)';
  END IF;
END $$;

-- Verify the accounts were created
SELECT 
  p.user_id,
  p.role,
  p.full_name,
  p.email,
  u.email as auth_email,
  u.created_at
FROM profiles p
JOIN auth.users u ON p.auth_user_id = u.id
WHERE p.user_id IN ('HO001', 'DEO001')
ORDER BY p.user_id;
