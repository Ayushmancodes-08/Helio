-- DEBUG SCRIPT: INSPECT SCHEMA AND PERMISSIONS

-- 1. Check columns of 'profiles' table to ensure 'auth_user_id' and 'role' exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- 2. Check Triggers on 'districts' table (Triggers can cause hidden RLS errors)
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'districts';

-- 3. Check Policies on 'districts' table
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'districts';

-- 4. Check if ANY user has 'data_entry' role
SELECT count(*) as data_entry_user_count FROM profiles WHERE role = 'data_entry';
