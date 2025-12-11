# Database Setup Guide

## Required Database Changes

### 1. Update wristband_data table to include user_id

Run this SQL in your Supabase SQL Editor:

```sql
-- Add user_id column to wristband_data table
ALTER TABLE wristband_data 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX idx_wristband_data_user_id ON wristband_data(user_id);

-- Create index for user_id + created_at for optimized time-series queries
CREATE INDEX idx_wristband_data_user_created ON wristband_data(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE wristband_data ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own data
CREATE POLICY "Users can view their own wristband data"
ON wristband_data
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy: Users can insert their own data
CREATE POLICY "Users can insert their own wristband data"
ON wristband_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own data
CREATE POLICY "Users can update their own wristband data"
ON wristband_data
FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy: Users can delete their own data
CREATE POLICY "Users can delete their own wristband data"
ON wristband_data
FOR DELETE
USING (auth.uid() = user_id);
```

### 2. Create user_profiles table (optional but recommended)

```sql
-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);
```

### 3. Create function to automatically create user profile

```sql
-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Update existing data (if you have test data)

```sql
-- If you want to assign existing data to a specific user, run:
-- UPDATE wristband_data SET user_id = 'YOUR-USER-UUID-HERE' WHERE user_id IS NULL;

-- Or delete test data:
-- DELETE FROM wristband_data WHERE user_id IS NULL;
```

## Supabase Authentication Setup

1. Go to Supabase Dashboard → Authentication → Settings
2. Enable Email provider (should be enabled by default)
3. Optional: Configure email templates for better UX
4. Optional: Enable other providers (Google, GitHub, etc.)

## Testing

After running the SQL scripts:

1. Sign up a new user
2. The user profile should be automatically created
3. Insert wristband data for that user
4. Verify RLS is working by trying to query another user's data (should return empty)

## Security Notes

- ✅ Row Level Security (RLS) ensures users can only access their own data
- ✅ Foreign key constraints ensure data integrity
- ✅ Indexes optimize query performance
- ✅ CASCADE DELETE ensures cleanup when user is deleted
