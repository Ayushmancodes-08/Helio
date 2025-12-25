-- Check if Dr. Ayushman Patra exists and has proper specialization
-- Run this in Supabase SQL Editor

-- 1. Check all doctors in the system
SELECT 
    id,
    user_id,
    full_name,
    role,
    specialization,
    email,
    phone
FROM profiles
WHERE role = 'doctor'
ORDER BY full_name;

-- 2. Specifically check for Dr. Ayushman Patra
SELECT 
    id,
    user_id,
    full_name,
    role,
    specialization,
    email
FROM profiles
WHERE full_name ILIKE '%ayushman%' OR full_name ILIKE '%patra%';

-- 3. If Dr. Patra exists but has no specialization, update it:
-- UNCOMMENT AND RUN ONLY IF NEEDED:
/*
UPDATE profiles
SET specialization = 'Cardiology'
WHERE full_name ILIKE '%ayushman%patra%' AND role = 'doctor';
*/

-- 4. Check all unique specializations that exist
SELECT DISTINCT specialization
FROM profiles
WHERE role = 'doctor' AND specialization IS NOT NULL
ORDER BY specialization;
