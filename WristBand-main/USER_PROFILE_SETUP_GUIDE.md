# 🎯 User Profile Auto-Creation Setup Guide

## Overview
This guide will set up automatic user profile creation when users sign up. Every time a new user registers, a profile entry will be automatically created in the `user_profiles` table.

---

## 📋 Setup Instructions

### Step 1: Run the SQL Script

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the Script**
   - Open the file: `CREATE_USER_PROFILE_TABLE.sql`
   - Copy ALL the content
   - Paste it into the SQL Editor
   - Click **"Run"** or press `Ctrl+Enter`

4. **Verify Success**
   - You should see success messages
   - The verification queries at the bottom will show:
     - ✅ Table created
     - ✅ Trigger created
     - ✅ Existing user profiles (if any)

---

## 🔍 What This Does

### 1. Creates `user_profiles` Table
```
Columns:
- id (UUID, Primary Key) - Links to auth.users
- email (TEXT)
- full_name (TEXT)
- avatar_url (TEXT)
- phone (TEXT)
- date_of_birth (DATE)
- gender (TEXT)
- address (TEXT)
- city (TEXT)
- country (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### 2. Enables Row Level Security (RLS)
- Users can only view/edit their own profile
- Automatic security enforcement

### 3. Creates Auto-Trigger
- **Trigger Name**: `on_auth_user_created`
- **Function**: `handle_new_user()`
- **Action**: Automatically creates profile on signup
- **Data Captured**: id, email, full_name, avatar_url

### 4. Auto-Update Timestamp
- `updated_at` automatically updates when profile is modified

---

## 🎬 How It Works

### When a User Signs Up:

```
User fills signup form
    ↓
[Email, Password, Full Name submitted]
    ↓
Supabase creates auth.users record
    ↓
🔥 TRIGGER FIRES AUTOMATICALLY 🔥
    ↓
handle_new_user() function executes
    ↓
user_profiles record created with:
  - id = user's UUID
  - email = user's email
  - full_name = from signup form
  - avatar_url = (if provided)
    ↓
✅ Profile Created!
```

---

## 🧪 Testing

### Test New Signup:

1. **Sign Up a New User**
   ```
   Go to: http://localhost:3000/auth
   Click: "Don't have an account? Sign up"
   Enter:
     - Full Name: "Test User"
     - Email: "test@example.com"
     - Password: "password123"
   Click: "Sign Up"
   ```

2. **Verify Profile Created**
   - Go to Supabase Dashboard → Table Editor
   - Select `user_profiles` table
   - You should see the new profile with:
     - ✅ User's UUID
     - ✅ Email address
     - ✅ Full name
     - ✅ Created timestamp

3. **Check in SQL Editor**
   ```sql
   SELECT * FROM user_profiles 
   WHERE email = 'test@example.com';
   ```

---

## 🔧 Accessing User Profiles in Your App

### Fetch Current User's Profile:

```javascript
// In any component
const supabase = createClientComponentClient();

// Get current user's profile
const { data: profile, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id)
  .single();

console.log(profile);
// Output: { id, email, full_name, avatar_url, ... }
```

### Update User Profile:

```javascript
const { error } = await supabase
  .from('user_profiles')
  .update({
    full_name: 'New Name',
    phone: '+1234567890',
    city: 'New York'
  })
  .eq('id', user.id);
```

---

## 📊 Useful Queries

### Check All Profiles:
```sql
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.created_at,
  u.email_confirmed_at
FROM user_profiles p
LEFT JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;
```

### Check User Without Profile:
```sql
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON p.id = u.id
WHERE p.id IS NULL;
```

### Manually Create Profile for Existing User:
```sql
INSERT INTO user_profiles (id, email, full_name)
VALUES (
  'USER-UUID-HERE',
  'user@example.com',
  'Full Name Here'
);
```

---

## 🛡️ Security Features

✅ **Row Level Security (RLS)** - Enabled
- Users can ONLY access their own profile
- Automatic enforcement by Supabase

✅ **Cascade Delete** - Enabled
- If user is deleted, profile is automatically deleted

✅ **Foreign Key Constraint** - Enabled
- Profile must reference valid auth.users record

✅ **Security Definer** - Enabled on trigger
- Function runs with elevated privileges to insert into user_profiles

---

## 🔍 Troubleshooting

### Profile Not Created?

1. **Check Trigger Exists:**
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. **Check Function Exists:**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name = 'handle_new_user';
   ```

3. **Test Trigger Manually:**
   ```sql
   -- Sign up a test user and check
   SELECT * FROM user_profiles
   ORDER BY created_at DESC
   LIMIT 5;
   ```

### Error: "duplicate key value violates unique constraint"

This means profile already exists. To fix:
```sql
DELETE FROM user_profiles WHERE id = 'USER-UUID';
-- Then sign up again or run:
INSERT INTO user_profiles (id, email, full_name)
VALUES ('USER-UUID', 'email@example.com', 'Full Name');
```

---

## ✅ Next Steps

After setup:

1. ✅ Test with new user signup
2. ✅ Verify profile creation in Supabase dashboard
3. ✅ Create a profile page component (optional)
4. ✅ Add profile editing functionality (optional)
5. ✅ Use profile data in your dashboard

---

## 🎨 Optional: Create Profile Page Component

Create `src/app/profile/page.js`:

```javascript
"use client";
import { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@/lib/auth';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClientComponentClient(), []);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) setProfile(data);
    setLoading(false);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>User Profile</h1>
      <p>Email: {profile?.email}</p>
      <p>Name: {profile?.full_name}</p>
      <p>Joined: {new Date(profile?.created_at).toLocaleDateString()}</p>
    </div>
  );
}
```

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs (Dashboard → Logs)
2. Verify RLS policies are correct
3. Ensure trigger is enabled
4. Test with SQL queries first

---

**✨ You're all set! User profiles will now be automatically created on signup!**
