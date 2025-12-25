-- ==========================================
-- PHARMACIST DASHBOARD FIXES
-- Run this script in your Supabase SQL Editor
-- ==========================================

-- 1. Create the pharmacy_sales table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.pharmacy_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pharmacist_id UUID REFERENCES public.profiles(id),
    medicine_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    total_amount NUMERIC NOT NULL,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1b. Add missing 'status' column to Prescriptions table if it doesn't exist
ALTER TABLE public.prescriptions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Issued';

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.pharmacy_sales ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for Sales (Drop first to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Pharmacists can view their own sales" ON public.pharmacy_sales;
DROP POLICY IF EXISTS "Pharmacists can insert sales" ON public.pharmacy_sales;

CREATE POLICY "Pharmacists can view their own sales"
ON public.pharmacy_sales FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = pharmacy_sales.pharmacist_id
    AND profiles.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Pharmacists can insert sales"
ON public.pharmacy_sales FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = pharmacy_sales.pharmacist_id
    AND profiles.auth_user_id = auth.uid()
    AND profiles.role = 'pharmacist'
  )
);

-- 4. Fix Prescriptions Permissions
-- Pharmacists need to be able to UPDATE prescriptions to mark them as fields
-- and SELECT them to view the queue.

DROP POLICY IF EXISTS "Pharmacists can update prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Pharmacists can view prescriptions" ON public.prescriptions;

CREATE POLICY "Pharmacists can update prescriptions"
ON public.prescriptions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role = 'pharmacist'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role = 'pharmacist'
  )
);

-- Ensure Pharmacists can see all prescriptions (or restrict to their hospital if needed)
-- For now, we allow them to see all to ensure the dashboard works.
CREATE POLICY "Pharmacists can view prescriptions"
ON public.prescriptions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role = 'pharmacist'
  )
  OR
  -- Keep existing logic for doctors/patients if needed, or rely on other policies.
  -- This simple policy adds permission for pharmacists explicitly.
  (patient_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()))
  OR
  (doctor_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()))
);
