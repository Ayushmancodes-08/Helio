-- ============================================
-- HEALTH METRICS & ALERTS MIGRATION
-- Run this in your Supabase SQL Editor to support Health Official & Data Operator dashboards
-- ============================================

-- 1. Table: district_metrics (Regional Data)
CREATE TABLE IF NOT EXISTS district_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_name TEXT NOT NULL UNIQUE, -- Unique constraint to prevent duplicate district entries
  population INTEGER DEFAULT 0,
  total_hospitals INTEGER DEFAULT 0,
  total_beds INTEGER DEFAULT 0,
  occupied_beds INTEGER DEFAULT 0,
  total_ambulances INTEGER DEFAULT 0,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: disease_reports (Disease Surveillance)
CREATE TABLE IF NOT EXISTS disease_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_name TEXT NOT NULL, -- Link by name for simplicity in aggregation
  disease_name TEXT NOT NULL,
  case_count INTEGER DEFAULT 0,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reported_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: health_alerts (Public Health Alerts)
CREATE TABLE IF NOT EXISTS health_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
  status TEXT CHECK (status IN ('Active', 'Resolved')) DEFAULT 'Active',
  issued_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE district_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;

-- District Metrics Policies
DROP POLICY IF EXISTS "Public read district metrics" ON district_metrics;
CREATE POLICY "Public read district metrics" ON district_metrics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Data Operators can insert/update district metrics" ON district_metrics;
CREATE POLICY "Data Operators can insert/update district metrics" ON district_metrics
  FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM profiles WHERE role IN ('data-entry-operator', 'health-official')));

-- Disease Reports Policies
DROP POLICY IF EXISTS "Health Officials view disease reports" ON disease_reports;
CREATE POLICY "Health Officials view disease reports" ON disease_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Data Operators manage disease reports" ON disease_reports;
CREATE POLICY "Data Operators manage disease reports" ON disease_reports
  FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM profiles WHERE role IN ('data-entry-operator', 'health-official')));

-- Health Alerts Policies
DROP POLICY IF EXISTS "Public read active alerts" ON health_alerts;
CREATE POLICY "Public read active alerts" ON health_alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Health Officials manage alerts" ON health_alerts;
CREATE POLICY "Health Officials manage alerts" ON health_alerts
  FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM profiles WHERE role = 'health-official'));

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

DROP TRIGGER IF EXISTS on_district_metrics_updated ON district_metrics;
CREATE TRIGGER on_district_metrics_updated BEFORE UPDATE ON district_metrics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_disease_reports_updated ON disease_reports;
CREATE TRIGGER on_disease_reports_updated BEFORE UPDATE ON disease_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_health_alerts_updated ON health_alerts;
CREATE TRIGGER on_health_alerts_updated BEFORE UPDATE ON health_alerts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

