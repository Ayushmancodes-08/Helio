-- ============================================
-- DATABASE PERFORMANCE OPTIMIZATION PACK
-- Adds indexes to frequent lookup columns to speed up Dashboard queries & RLS
-- ============================================

-- 1. Profiles Table (Heavily used in RLS and Lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name); -- For search
-- auth_user_id is already UNIQUE, so it has an index.

-- 2. Appointments & Workflow (Date sorting and user filtering)
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date); -- For "Recent" lists

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);

CREATE INDEX IF NOT EXISTS idx_lab_reports_patient_id ON lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_inventory_pharmacist_id ON inventory(pharmacist_id);

-- 3. Health Infrastructure (Aggregations)
CREATE INDEX IF NOT EXISTS idx_hospitals_district_id ON hospitals(district_id);
CREATE INDEX IF NOT EXISTS idx_districts_name ON districts(name);

-- 4. Disease Reports (Trending & regional data)
CREATE INDEX IF NOT EXISTS idx_disease_reports_hospital_id ON disease_reports(hospital_id);
CREATE INDEX IF NOT EXISTS idx_disease_reports_district_id ON disease_reports(district_id);
CREATE INDEX IF NOT EXISTS idx_disease_reports_date ON disease_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_disease_reports_disease ON disease_reports(disease_name);

-- 5. RLS Helper Indexes
-- Speed up "auth.uid() = ..." checks if joined
-- (Supabase handles auth.uid() mostly in memory, but joining profiles is common)

-- ============================================
-- VACUUM ANALYZE
-- ============================================
-- Refreshes table statistics for the query planner
-- (You usually run this manually, but putting it here as a reminder/command if the editor supports it)
-- VACUUM ANALYZE; 
