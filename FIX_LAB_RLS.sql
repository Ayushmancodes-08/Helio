-- Check existing RLS policies for lab_reports
SELECT * FROM pg_policies WHERE tablename = 'lab_reports';

-- Check if the current user (if running in SQL editor, this won't show the app user, but useful to know structure)
-- We will just force-fix the policy.

-- Re-apply the correct INSERT policy for Doctors
DROP POLICY IF EXISTS "Doctors can create lab reports" ON lab_reports;

CREATE POLICY "Doctors can create lab reports"
  ON lab_reports FOR INSERT
  WITH CHECK (
    -- The user must be authenticated
    auth.role() = 'authenticated' AND
    -- The doctor_id in the new row must match the user's profile ID
    doctor_id IN (
      SELECT id FROM profiles 
      WHERE auth_user_id = auth.uid() 
      AND role = 'doctor'
    )
  );

-- Verify generic SELECT policy for testing (optional but good for debugging)
DROP POLICY IF EXISTS "Doctors can view their created reports" ON lab_reports;
CREATE POLICY "Doctors can view their created reports"
  ON lab_reports FOR SELECT
  USING (
    doctor_id IN (
      SELECT id FROM profiles 
      WHERE auth_user_id = auth.uid()
    )
  );
