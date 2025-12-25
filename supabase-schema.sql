-- ============================================
-- GRAMEEN SWASTHYA SETU - COMPLETE DATABASE SCHEMA
-- Supabase PostgreSQL Migration Script
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- CLEANUP: Drop existing objects (if any)
-- ============================================
-- Run this section ONLY if you need to reset the database
-- Comment out this section for first-time setup

-- Drop triggers first
DROP TRIGGER IF EXISTS on_inventory_updated ON inventory;
DROP TRIGGER IF EXISTS on_lab_reports_updated ON lab_reports;
DROP TRIGGER IF EXISTS on_prescriptions_updated ON prescriptions;
DROP TRIGGER IF EXISTS on_appointments_updated ON appointments;
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS lab_reports CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- TABLE CREATION
-- ============================================

-- Table: profiles (User accounts for all roles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE, -- Custom UserID for staff (NULL for patients)
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'pharmacist', 'health-official', 'data-entry-operator')),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  age INTEGER,
  gender TEXT,
  address TEXT,
  photo TEXT,
  license_number TEXT, -- For doctors/pharmacists
  specialization TEXT, -- For doctors
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: appointments (Patient ↔ Doctor scheduling)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_date TIMESTAMPTZ NOT NULL,
  appointment_time TIME NOT NULL,
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('Video', 'In-Person')),
  status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Completed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: prescriptions (Doctor → Patient → Pharmacist workflow)
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medication TEXT NOT NULL,
  dosage TEXT NOT NULL,
  instructions TEXT,
  issued_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: lab_reports (Doctor → Patient lab results)
CREATE TABLE IF NOT EXISTS lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  report_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Available')),
  report_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: inventory (Pharmacist medicine stock)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  expiry_date DATE,
  price DECIMAL(10, 2),
  pharmacist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Prescriptions indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment ON prescriptions(appointment_id);

-- Lab reports indexes
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient ON lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_doctor ON lab_reports(doctor_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_status ON lab_reports(status);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_medicine ON inventory(medicine_name);
CREATE INDEX IF NOT EXISTS idx_inventory_pharmacist ON inventory(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON inventory(expiry_date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-create profile when new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (auth_user_id, role, full_name, email, phone)
  VALUES (
    NEW.id,
    'patient', -- Default role
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Auto-update updated_at for profiles
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Auto-update updated_at for appointments
DROP TRIGGER IF EXISTS on_appointments_updated ON appointments;
CREATE TRIGGER on_appointments_updated
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Auto-update updated_at for prescriptions
DROP TRIGGER IF EXISTS on_prescriptions_updated ON prescriptions;
CREATE TRIGGER on_prescriptions_updated
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Auto-update updated_at for lab_reports
DROP TRIGGER IF EXISTS on_lab_reports_updated ON lab_reports;
CREATE TRIGGER on_lab_reports_updated
  BEFORE UPDATE ON lab_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Auto-update updated_at for inventory
DROP TRIGGER IF EXISTS on_inventory_updated ON inventory;
CREATE TRIGGER on_inventory_updated
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Policy: Public can lookup user_id for staff login (UserID → Email mapping)
CREATE POLICY "Public can lookup user_id for auth"
  ON profiles FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- ============================================
-- APPOINTMENTS TABLE POLICIES
-- ============================================

-- Policy: Patients can view their own appointments
CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  USING (patient_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- Policy: Patients can create their own appointments
CREATE POLICY "Patients can create own appointments"
  ON appointments FOR INSERT
  WITH CHECK (patient_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- Policy: Patients can update their own appointments
CREATE POLICY "Patients can update own appointments"
  ON appointments FOR UPDATE
  USING (patient_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- Policy: Doctors can view their assigned appointments
CREATE POLICY "Doctors can view their appointments"
  ON appointments FOR SELECT
  USING (doctor_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid() AND role = 'doctor'));

-- Policy: Doctors can update their assigned appointments
CREATE POLICY "Doctors can update their appointments"
  ON appointments FOR UPDATE
  USING (doctor_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid() AND role = 'doctor'));

-- Policy: Health officials can view all appointments (analytics)
CREATE POLICY "Health officials can view all appointments"
  ON appointments FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'health-official'));

-- ============================================
-- PRESCRIPTIONS TABLE POLICIES
-- ============================================

-- Policy: Doctors can create prescriptions
CREATE POLICY "Doctors can create prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (doctor_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid() AND role = 'doctor'));

-- Policy: Doctors can view their prescriptions
CREATE POLICY "Doctors can view their prescriptions"
  ON prescriptions FOR SELECT
  USING (doctor_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid() AND role = 'doctor'));

-- Policy: Patients can view their own prescriptions
CREATE POLICY "Patients can view own prescriptions"
  ON prescriptions FOR SELECT
  USING (patient_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- Policy: Pharmacists can view all prescriptions (for dispensing)
CREATE POLICY "Pharmacists can view all prescriptions"
  ON prescriptions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'pharmacist'));

-- Policy: Health officials can view all prescriptions (analytics)
CREATE POLICY "Health officials can view all prescriptions"
  ON prescriptions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'health-official'));

-- ============================================
-- LAB REPORTS TABLE POLICIES
-- ============================================

-- Policy: Doctors can create lab reports
CREATE POLICY "Doctors can create lab reports"
  ON lab_reports FOR INSERT
  WITH CHECK (doctor_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid() AND role = 'doctor'));

-- Policy: Doctors can update lab reports
CREATE POLICY "Doctors can update lab reports"
  ON lab_reports FOR UPDATE
  USING (doctor_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid() AND role = 'doctor'));

-- Policy: Patients can view their own lab reports
CREATE POLICY "Patients can view own lab reports"
  ON lab_reports FOR SELECT
  USING (patient_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- Policy: Health officials can view all lab reports (analytics)
CREATE POLICY "Health officials can view all lab reports"
  ON lab_reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'health-official'));

-- ============================================
-- INVENTORY TABLE POLICIES
-- ============================================

-- Policy: Pharmacists can manage all inventory
CREATE POLICY "Pharmacists can manage inventory"
  ON inventory FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'pharmacist'));

-- Policy: Patients can view inventory (stock checking)
CREATE POLICY "Patients can view inventory"
  ON inventory FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid()));

-- Policy: Health officials can view inventory (analytics)
CREATE POLICY "Health officials can view inventory"
  ON inventory FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'health-official'));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these queries after migration to verify setup

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Count policies per table
-- SELECT schemaname, tablename, COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY schemaname, tablename
-- ORDER BY tablename;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- If you see no errors, your database is ready!
-- Next steps:
-- 1. Verify tables appear in Table Editor
-- 2. Test authentication flows
-- 3. Create test accounts for each role
