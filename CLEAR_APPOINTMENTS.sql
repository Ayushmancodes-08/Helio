-- ============================================
-- CLEAR ALL DATA FOR HACKATHON DEMO
-- ============================================
-- This script removes all appointments and patient data
-- Use this before your hackathon demo for a clean start
-- ============================================

-- 1. Delete all appointments first (due to foreign key constraints)
DELETE FROM appointments;

-- 2. Delete all patient profiles (this will reset patient count to 0)
DELETE FROM profiles WHERE role = 'patient';

-- 3. Optional: Also clear other related patient data
DELETE FROM prescriptions;
DELETE FROM lab_reports;

-- 4. Reset auto-increment counters
ALTER SEQUENCE IF EXISTS appointments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS prescriptions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS lab_reports_id_seq RESTART WITH 1;

-- 5. Verify the cleanup
SELECT 
    (SELECT COUNT(*) FROM appointments) as appointments_count,
    (SELECT COUNT(*) FROM profiles WHERE role = 'patient') as patients_count,
    (SELECT COUNT(*) FROM prescriptions) as prescriptions_count,
    (SELECT COUNT(*) FROM lab_reports) as lab_reports_count;

-- ============================================
-- DONE! All demo data has been cleared.
-- Patient registration count = 0
-- ============================================
