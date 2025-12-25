-- ============================================
-- 1. CLEANUP & ISOLATION
-- ============================================

-- Ensure Pharmacists do NOT have Doctor fields
UPDATE profiles 
SET specialization = NULL, license_number = NULL 
WHERE role = 'pharmacist';

-- Ensure Patients do NOT have Staff fields
UPDATE profiles 
SET specialization = NULL, license_number = NULL 
WHERE role = 'patient';

-- ============================================
-- 2. CREATE SEPARATE "TABLES" (VIEWS)
-- As requested, this organizes data into separate logical views
-- You can now query specific tables like: SELECT * FROM doctor_profiles;
-- ============================================

-- Doctor Table View
CREATE OR REPLACE VIEW doctor_profiles AS
SELECT id, full_name, email, phone, specialization, license_number, photo, created_at
FROM profiles
WHERE role = 'doctor';

-- Pharmacist Table View
CREATE OR REPLACE VIEW pharmacist_profiles AS
SELECT id, full_name, email, phone, license_number, photo, created_at
FROM profiles
WHERE role = 'pharmacist';

-- Patient Table View
CREATE OR REPLACE VIEW patient_profiles AS
SELECT id, full_name, email, phone, age, gender, address, photo, created_at
FROM profiles
WHERE role = 'patient';

-- Health Official Table View
CREATE OR REPLACE VIEW health_official_profiles AS
SELECT id, full_name, email, phone, photo, created_at
FROM profiles
WHERE role = 'health-official';

-- Data Entry Operator Table View
CREATE OR REPLACE VIEW operator_profiles AS
SELECT id, full_name, email, phone, photo, created_at
FROM profiles
WHERE role = 'data-entry-operator';

-- ============================================
-- 3. DIAGNOSTIC: Check for Duplicate Emails
-- ============================================
SELECT email, COUNT(*) as count 
FROM profiles 
GROUP BY email 
HAVING COUNT(*) > 1;
