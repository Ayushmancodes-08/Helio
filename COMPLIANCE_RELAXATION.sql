-- ============================================
-- OPEN ACCESS COMPLIANCE RELAXATION
-- Allows disease report submission without strict auth
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Enable data submission for ANYONE (including anonymous/hardcoded users)
DROP POLICY IF EXISTS "Allow public submission of disease reports" ON disease_reports;

CREATE POLICY "Allow public submission of disease reports"
ON disease_reports
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Allow reading for ANYONE (so the dashboard works immediately)
DROP POLICY IF EXISTS "Allow public reading of disease reports" ON disease_reports;

CREATE POLICY "Allow public reading of disease reports"
ON disease_reports
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Also allow deleting for ANYONE (since we are in single-account mode)
DROP POLICY IF EXISTS "Allow public deletion of disease reports" ON disease_reports;

CREATE POLICY "Allow public deletion of disease reports"
ON disease_reports
FOR DELETE
TO anon, authenticated
USING (true);

-- -- RAISE NOTICE '✅ Compliance Relaxed: Public access enabled for disease_reports';
