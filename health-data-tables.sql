-- ============================================
-- ADDITIONAL TABLES FOR HEALTH OFFICIAL & DATA ENTRY OPERATOR
-- Add these tables to your existing Supabase schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Table: districts (Managed by Data Entry Operators)
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: hospitals (Managed by Data Entry Operators)
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  population INTEGER DEFAULT 0,
  total_beds INTEGER DEFAULT 0,
  occupied_beds INTEGER DEFAULT 0,
  ambulances INTEGER DEFAULT 0,
  doctors INTEGER DEFAULT 0,
  nurses INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, name)
);

-- Table: disease_cases (Daily disease data entry)
CREATE TABLE IF NOT EXISTS disease_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  disease_name TEXT NOT NULL,
  case_count INTEGER NOT NULL DEFAULT 0,
  report_date DATE NOT NULL,
  severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  notes TEXT,
  entered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hospital_id, disease_name, report_date)
);

-- Table: health_alerts (Public health alerts from Health Officials)
CREATE TABLE IF NOT EXISTS health_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
  target_district_id UUID REFERENCES districts(id) ON DELETE SET NULL, -- NULL means all districts
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Resolved')),
  issued_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_hospitals_district ON hospitals(district_id);
CREATE INDEX IF NOT EXISTS idx_disease_cases_hospital ON disease_cases(hospital_id);
CREATE INDEX IF NOT EXISTS idx_disease_cases_date ON disease_cases(report_date);
CREATE INDEX IF NOT EXISTS idx_health_alerts_status ON health_alerts(status);
CREATE INDEX IF NOT EXISTS idx_health_alerts_district ON health_alerts(target_district_id);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATING updated_at
-- ============================================

-- Reuse existing handle_updated_at function
CREATE TRIGGER on_districts_updated
  BEFORE UPDATE ON districts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER on_hospitals_updated
  BEFORE UPDATE ON hospitals
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER on_disease_cases_updated
  BEFORE UPDATE ON disease_cases
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER on_health_alerts_updated
  BEFORE UPDATE ON health_alerts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;

-- Districts: DEO can create/update, everyone can read
CREATE POLICY "Anyone can view districts"
  ON districts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Data Entry Operators can manage districts"
  ON districts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_user_id = auth.uid()
      AND profiles.role = 'data-entry-operator'
    )
  );

-- Hospitals: DEO can create/update, everyone can read
CREATE POLICY "Anyone can view hospitals"
  ON hospitals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Data Entry Operators can manage hospitals"
  ON hospitals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_user_id = auth.uid()
      AND profiles.role IN ('data-entry-operator', 'health-official')
    )
  );

-- Disease Cases: DEO can create/update, health officials can read
CREATE POLICY "Health staff can view disease cases"
  ON disease_cases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_user_id = auth.uid()
      AND profiles.role IN ('data-entry-operator', 'health-official', 'doctor')
    )
  );

CREATE POLICY "Data Entry Operators can manage disease cases"
  ON disease_cases FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_user_id = auth.uid()
      AND profiles.role = 'data-entry-operator'
    )
  );

-- Health Alerts: Health Officials create, everyone reads
CREATE POLICY "Anyone can view health alerts"
  ON health_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Health Officials can manage alerts"
  ON health_alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_user_id = auth.uid()
      AND profiles.role = 'health-official'
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
/*
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('districts', 'hospitals', 'disease_cases', 'health_alerts')
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('districts', 'hospitals', 'disease_cases', 'health_alerts');
*/
