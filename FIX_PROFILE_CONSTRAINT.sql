-- FIX CONSTRAINT AND UPDATE ROLES

-- 1. DROP the old restrictive constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. ADD a new constraint that allows the snake_case roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
  'patient', 
  'doctor', 
  'pharmacist', 
  'admin', 
  'super_admin', 
  'data_entry',         -- New snake_case
  'health_official',    -- New snake_case
  'data-entry-operator', -- Keep for legacy safety
  'health-official'      -- Keep for legacy safety
));

-- 3. NOW update the roles (This will succeed now)
UPDATE profiles
SET role = 'data_entry'
WHERE role = 'data-entry-operator' 
   OR email = 'dataentry@hospital.com';

UPDATE profiles
SET role = 'health_official'
WHERE role = 'health-official'
   OR email = 'healthofficial@hospital.com';

-- 4. Verify
SELECT role, count(*) FROM profiles GROUP BY role;
