-- Add latitude and longitude columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS latitude float8,
ADD COLUMN IF NOT EXISTS longitude float8;

-- Create an index for faster geospatial querying (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles (latitude, longitude);

-- Comment to explain usage
COMMENT ON COLUMN profiles.latitude IS 'Pharmacist or User latitude coordinate';
COMMENT ON COLUMN profiles.longitude IS 'Pharmacist or User longitude coordinate';
