-- FIX ROLE NAME MISMATCH
-- The issue is that the users were created with roles like 'data-entry-operator' (with hyphens)
-- But the security policies expect 'data_entry' (with underscores).

-- 1. Standardization: Update 'data-entry-operator' -> 'data_entry'
UPDATE profiles
SET role = 'data_entry'
WHERE role = 'data-entry-operator' 
   OR email = 'dataentry@hospital.com';

-- 2. Standardization: Update 'health-official' -> 'health_official'
UPDATE profiles
SET role = 'health_official'
WHERE role = 'health-official'
   OR email = 'healthofficial@hospital.com';

-- 3. Verify the fix
SELECT role, count(*) 
FROM profiles 
WHERE role IN ('data_entry', 'health_official')
GROUP BY role;
