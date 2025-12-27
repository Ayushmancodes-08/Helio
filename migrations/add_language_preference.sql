-- Migration: Add language_preference column to profiles table
-- This migration adds support for storing user language preferences in the database

-- Add language_preference column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'en-IN';

-- Add constraint to ensure valid language codes
ALTER TABLE profiles ADD CONSTRAINT valid_language_preference 
  CHECK (language_preference IN ('hi-IN', 'en-IN', 'bn-IN', 'te-IN'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_language_preference ON profiles(language_preference);

-- Add comment for documentation
COMMENT ON COLUMN profiles.language_preference IS 'User preferred language locale (hi-IN, en-IN, bn-IN, te-IN)';
