-- ==========================================
-- HEALTH ALERTS SYSTEM FIXES
-- Run this script in your Supabase SQL Editor
-- ==========================================

-- 1. Ensure health_alerts table exists and has correct schema
CREATE TABLE IF NOT EXISTS public.health_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')) NOT NULL,
    status TEXT CHECK (status IN ('Active', 'Resolved')) DEFAULT 'Active',
    district_id UUID REFERENCES public.districts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1b. Add district_id if missing (for existing tables)
ALTER TABLE public.health_alerts 
ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES public.districts(id);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Health Officials can manage alerts" ON public.health_alerts;
DROP POLICY IF EXISTS "Everyone can view active alerts" ON public.health_alerts;
DROP POLICY IF EXISTS "health_officials_insert" ON public.health_alerts;
DROP POLICY IF EXISTS "health_officials_update" ON public.health_alerts;
DROP POLICY IF EXISTS "health_officials_delete" ON public.health_alerts;
DROP POLICY IF EXISTS "authenticated_select" ON public.health_alerts;

-- 4. Create NEW RLS Policies with explicit operations

-- Policy 1: Health Officials can INSERT alerts
CREATE POLICY "health_officials_insert"
ON public.health_alerts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role = 'health_official'
  )
);

-- Policy 2: Health Officials can UPDATE alerts
CREATE POLICY "health_officials_update"
ON public.health_alerts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role = 'health_official'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role = 'health_official'
  )
);

-- Policy 3: Health Officials can DELETE alerts
CREATE POLICY "health_officials_delete"
ON public.health_alerts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role = 'health_official'
  )
);

-- Policy 4: All authenticated users can SELECT (view) alerts
CREATE POLICY "authenticated_select"
ON public.health_alerts
FOR SELECT
TO authenticated
USING (true);

-- 5. VERIFICATION QUERY - Run this separately to check your current user's role
-- Uncomment the line below and run it separately to verify your role:
-- SELECT id, auth_user_id, role, full_name FROM public.profiles WHERE auth_user_id = auth.uid();
