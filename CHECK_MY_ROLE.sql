-- Quick check: What is my current role?
-- Run this AFTER logging in as the Data Entry Operator

SELECT 
  profiles.role,
  profiles.email,
  auth.uid() as my_auth_id,
  profiles.auth_user_id
FROM profiles 
WHERE profiles.auth_user_id = auth.uid();

-- This should return:
-- role: 'data_entry' or 'data-entry-operator'
-- email: dataentry@hospital.com
-- The two IDs should match
