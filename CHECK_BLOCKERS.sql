-- =========================================================
-- CHECK FOR HIDDEN BLOCKERS (Triggers, Constraints, Functions)
-- =========================================================

-- 1. Check for TRIGGERS on districts table
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'districts';
-- If you see any triggers here, they might be blocking the insert

-- 2. Check for CHECK CONSTRAINTS
SELECT
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'districts'::regclass
AND contype = 'c';
-- Any constraints here could block inserts

-- 3. Check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'districts'
ORDER BY ordinal_position;
-- Make sure 'created_by' column exists and allows the type we're sending

-- 4. Test if you can INSERT directly (bypassing your app)
-- This will tell us if the problem is RLS or something else
INSERT INTO districts (name, created_by)
VALUES ('TEST_DISTRICT_DELETE_ME', auth.uid())
RETURNING *;
-- If this WORKS: Your RLS is fine, problem is in the app
-- If this FAILS with RLS error: RLS policies still blocking
-- If this FAILS with other error: There's a trigger/constraint issue
