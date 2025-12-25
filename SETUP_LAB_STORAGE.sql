-- ==========================================
-- SETUP LAB REPORTS STORAGE & PERMISSIONS (FIXED)
-- ==========================================

-- 1. Create the 'reports' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- NOTE: RLS is enabled by default on storage.objects, so we skip the ALTER command
-- which was causing the permission error.

-- 2. Storage Policies

-- Allow Authenticated users (Doctors) to UPLOAD files to 'reports' bucket
DROP POLICY IF EXISTS "Doctors can upload reports" ON storage.objects;
CREATE POLICY "Doctors can upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reports');

-- Allow Authenticated users to VIEW files in 'reports' bucket
DROP POLICY IF EXISTS "Authenticated users can view reports" ON storage.objects;
CREATE POLICY "Authenticated users can view reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reports');

-- 3. Lab Reports Table Policies (Re-applying database table fix as well)

-- Ensure Doctors can create records in the 'lab_reports' table
DROP POLICY IF EXISTS "Doctors can create lab reports" ON public.lab_reports;
CREATE POLICY "Doctors can create lab reports"
ON public.lab_reports FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  doctor_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid() AND role = 'doctor')
);

-- Ensure Doctors can view their created reports
DROP POLICY IF EXISTS "Doctors can view their created reports" ON public.lab_reports;
CREATE POLICY "Doctors can view their created reports"
ON public.lab_reports FOR SELECT
USING (
  doctor_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);
