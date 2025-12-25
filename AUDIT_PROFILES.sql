-- Check ALL profiles to see if names/roles are mismatched
SELECT id, role, full_name, email, phone, specialization, auth_user_id 
FROM profiles 
ORDER BY role, full_name;
