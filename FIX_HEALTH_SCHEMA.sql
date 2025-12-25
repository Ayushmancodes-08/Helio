-- ============================================
-- FULL RELATIONAL HEALTH SCHEMA MIGRATION
-- Replaces standard metrics with proper Districts -> Hospitals hierarchy
-- ============================================

-- 1. Districts Table
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  population INTEGER DEFAULT 0,
  total_beds INTEGER DEFAULT 0,
  occupied_beds INTEGER DEFAULT 0,
  ambulances INTEGER DEFAULT 0,
  doctors INTEGER DEFAULT 0,
  nurses INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Disease Reports Table (Updated to link to Hospitals)
-- We'll keep the existing table structure but ensure it can link to hospitals if needed,
-- or just keep using district_name/hospital_name strings if we want to be loose.
-- But ideal is:
ALTER TABLE disease_reports 
  ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id) ON DELETE SET NULL;

-- 4. Health Alerts (Already correct)

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Districts
DROP POLICY IF EXISTS "Public read districts" ON districts;
CREATE POLICY "Public read districts" ON districts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage districts" ON districts;
CREATE POLICY "Staff manage districts" ON districts FOR ALL 
  USING (auth.uid() IN (SELECT auth_user_id FROM profiles WHERE role IN ('data-entry-operator', 'health-official')));

-- Hospitals
DROP POLICY IF EXISTS "Public read hospitals" ON hospitals;
CREATE POLICY "Public read hospitals" ON hospitals FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage hospitals" ON hospitals;
CREATE POLICY "Staff manage hospitals" ON hospitals FOR ALL 
  USING (auth.uid() IN (SELECT auth_user_id FROM profiles WHERE role IN ('data-entry-operator', 'health-official')));


-- ============================================
-- CLEANUP OFF OLD FLAT TABLE
-- ============================================
-- We can drop the flat metrics table as we will auto-calculate metrics from hospitals now
DROP TABLE IF EXISTS district_metrics;
