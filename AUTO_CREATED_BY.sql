-- =========================================================
-- FIX: Add trigger to auto-populate created_by
-- This mimics what worked in the SQL test
-- =========================================================

-- 1. Create a function that auto-fills created_by
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically set created_by to current user if NULL
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger on districts
DROP TRIGGER IF EXISTS auto_set_created_by ON districts;
CREATE TRIGGER auto_set_created_by
  BEFORE INSERT ON districts
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

-- 3. Also for hospitals
DROP TRIGGER IF EXISTS auto_set_created_by_hospitals ON hospitals;
CREATE TRIGGER auto_set_created_by_hospitals
  BEFORE INSERT ON hospitals
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

-- Test: This should now work even without passing created_by
-- INSERT INTO districts (name) VALUES ('AUTO_TEST') RETURNING *;
