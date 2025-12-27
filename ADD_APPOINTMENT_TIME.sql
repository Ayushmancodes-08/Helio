-- Run this SQL in Supabase SQL Editor to add the appointment_time column
-- This will store the time slot selected by patients (e.g., "09:00 AM", "02:30 PM")

-- Add the column
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_time TEXT;

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments'
ORDER BY ordinal_position;
