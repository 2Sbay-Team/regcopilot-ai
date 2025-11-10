-- Add data region preference to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_region TEXT DEFAULT 'eu' CHECK (data_region IN ('eu', 'us', 'apac'));

-- Add index for region queries
CREATE INDEX IF NOT EXISTS idx_profiles_data_region ON profiles(data_region);

-- Add comment
COMMENT ON COLUMN profiles.data_region IS 'User preferred data residency region: eu (default), us, or apac';
