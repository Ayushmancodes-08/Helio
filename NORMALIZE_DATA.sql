-- ============================================
-- DATA CLEANUP: Normalize Disease Names
-- Fixes duplicate key errors in charts (dengue vs Dengue)
-- ============================================

-- 1. Update lowercase 'dengue' to 'Dengue'
UPDATE disease_reports 
SET disease_name = 'Dengue' 
WHERE disease_name = 'dengue';

-- 2. General cleanup: Capitalize first letter of all diseases (optional but good)
UPDATE disease_reports
SET disease_name = INITCAP(disease_name);

-- 3. Remove exact duplicates (same hospital, same date, same disease)
-- Keep only the most recently updated one
DELETE FROM disease_reports a USING (
      SELECT MAX(id::text)::uuid as id, hospital_id, disease_name, report_date
      FROM disease_reports 
      GROUP BY hospital_id, disease_name, report_date 
      HAVING COUNT(*) > 1
    ) b
WHERE a.hospital_id = b.hospital_id 
AND a.disease_name = b.disease_name 
AND a.report_date = b.report_date 
AND a.id <> b.id;

-- RAISE NOTICE '✅ Data Normalized: Disease names fixed and duplicates removed.';
