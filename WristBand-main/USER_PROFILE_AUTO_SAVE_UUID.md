# ✅ User Profile Auto-Creation - Complete Setup

## 🎯 What You Need to Know

The system is now set up with **3 layers of protection** to ensure every user gets a profile:

### Layer 1: Database Trigger (Primary) 🔥
- Automatically creates profile when user signs up
- Runs at database level (most reliable)
- Requires running `CREATE_USER_PROFILE_TABLE.sql`

### Layer 2: Signup Fallback (Secondary) 🛡️
- If trigger fails, app creates profile during signup
- Built into `signUp()` function
- **Already implemented in your code**

### Layer 3: Login Fallback (Tertiary) 🔒
- If user has no profile on login, creates it automatically
- Useful for users who signed up before trigger was set up
- **Already implemented in your code**

---

## 🚀 Setup Steps

### Step 1: Create User Profile Table & Trigger

Run this SQL in Supabase SQL Editor:

**File:** `CREATE_USER_PROFILE_TABLE.sql`

This creates:
- ✅ `user_profiles` table
- ✅ Automatic trigger on signup
- ✅ RLS policies
- ✅ Indexes

### Step 2: Fix Existing Users (if any)

Run this SQL to create profiles for existing users:

**File:** `VERIFY_AND_FIX_USER_PROFILES.sql`

Specifically run **STEP 5** from that file:

```sql
INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name', 
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ),
  COALESCE(
    u.raw_user_meta_data->>'avatar_url', 
    u.raw_user_meta_data->>'picture',
    ''
  )
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;
```

### Step 3: Verify Everything Works

Run this verification query:

```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as users_without_profiles
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id;
```

✅ **Expected Result:** `users_without_profiles = 0`

---

## 🧪 How to Test

### Test 1: Sign Up New User

1. Go to http://localhost:3000/auth
2. Click "Don't have an account? Sign up"
3. Enter:
   - Full Name: `Test Profile User`
   - Email: `testprofile@example.com`
   - Password: `password123`
4. Click "Sign Up"

### Test 2: Verify Profile Created

Run in Supabase SQL Editor:

```sql
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.email as profile_email,
  p.full_name,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
WHERE u.email = 'testprofile@example.com';
```

✅ **Expected:** Both `user_created` and `profile_created` should have timestamps

### Test 3: Check Console Logs

During signup, check browser console (F12):

**If trigger works:**
```
✅ User profile already exists (created by trigger)
```

**If fallback creates it:**
```
📝 Creating user profile manually...
✅ User profile created successfully
```

---

## 📊 What Gets Saved in user_profiles Table

When a user signs up, this data is saved:

```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",  // User's UUID from auth.users
  email: "user@example.com",                     // User's email
  full_name: "John Doe",                         // From signup form
  avatar_url: "",                                // Empty initially
  phone: null,                                   // Can be updated later
  date_of_birth: null,                           // Can be updated later
  gender: null,                                  // Can be updated later
  address: null,                                 // Can be updated later
  city: null,                                    // Can be updated later
  country: null,                                 // Can be updated later
  created_at: "2025-11-12T05:40:27.556898+00:00",
  updated_at: "2025-11-12T05:40:27.556898+00:00"
}
```

---

## 🔍 Useful Queries

### Check All Users and Their Profiles

```sql
SELECT 
  u.id,
  u.email,
  u.created_at as signup_date,
  u.email_confirmed_at,
  u.last_sign_in_at,
  p.full_name,
  p.phone,
  p.city,
  p.country
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
ORDER BY u.created_at DESC;
```

### Find Users Without Profiles

```sql
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
WHERE p.id IS NULL;
```

### Update a User's Profile

```sql
UPDATE public.user_profiles
SET 
  full_name = 'Updated Name',
  phone = '+1234567890',
  city = 'New York'
WHERE email = 'user@example.com';
```

### Delete a User and Their Profile

```sql
-- This will cascade delete the profile automatically
DELETE FROM auth.users WHERE email = 'user@example.com';
```

---

## 🔧 Code Changes Made

### File: `src/lib/auth.js`

#### 1. Enhanced `signUp()` function:
- ✅ Creates profile automatically after signup
- ✅ Checks if profile exists first (trigger may have created it)
- ✅ Only creates if missing
- ✅ Logs success/failure to console

#### 2. Enhanced `signIn()` function:
- ✅ Checks profile exists on login
- ✅ Creates profile if missing (for old users)
- ✅ Non-blocking (won't prevent login if profile creation fails)

#### 3. Added `ensureUserProfile()` helper:
- ✅ Reusable function to check/create profile
- ✅ Uses `maybeSingle()` to handle missing profiles gracefully
- ✅ Pulls full_name from user metadata

---

## 🛡️ How the 3-Layer Protection Works

### Scenario 1: Normal Signup (Trigger Works)
```
User signs up
  ↓
auth.users record created
  ↓
Database trigger fires automatically
  ↓
user_profiles record created
  ↓
App checks if profile exists
  ↓
"✅ User profile already exists (created by trigger)"
```

### Scenario 2: Trigger Disabled/Failed
```
User signs up
  ↓
auth.users record created
  ↓
Trigger doesn't fire (or fails)
  ↓
App checks if profile exists
  ↓
Profile missing!
  ↓
App creates profile manually
  ↓
"📝 Creating user profile manually..."
"✅ User profile created successfully"
```

### Scenario 3: Old User Logs In
```
User logs in (signed up before trigger was set up)
  ↓
Login successful
  ↓
App checks if profile exists
  ↓
Profile missing!
  ↓
App creates profile from user metadata
  ↓
"📝 Creating missing user profile on login..."
"✅ User profile created on login"
```

---

## 📝 Summary

### What's Automatic Now:

1. ✅ **New signups** → Profile created by trigger OR app fallback
2. ✅ **Existing users login** → Profile created if missing
3. ✅ **UUID saved** → Always matches auth.users.id
4. ✅ **Email saved** → From auth record
5. ✅ **Full name saved** → From signup form
6. ✅ **Triple redundancy** → 3 ways to ensure profile exists

### What You Need to Do:

1. ✅ Run `CREATE_USER_PROFILE_TABLE.sql` once (if not done)
2. ✅ Run `VERIFY_AND_FIX_USER_PROFILES.sql` STEP 5 (for existing users)
3. ✅ Test signup with new user
4. ✅ Verify profile created in database

### What Happens Automatically:

- ✅ Every new signup creates profile
- ✅ Every login ensures profile exists
- ✅ UUID automatically saved
- ✅ No manual intervention needed

---

## ✅ Checklist

- [ ] Run `CREATE_USER_PROFILE_TABLE.sql` in Supabase SQL Editor
- [ ] Run STEP 5 from `VERIFY_AND_FIX_USER_PROFILES.sql` (creates profiles for existing users)
- [ ] Verify trigger exists (query from STEP 2 in VERIFY_AND_FIX file)
- [ ] Test signup with new user
- [ ] Check console logs for profile creation messages
- [ ] Verify profile in database with SQL query
- [ ] Test login with existing user
- [ ] Confirm all users have profiles (STEP 6 query)

---

**🎉 Done! User UUIDs are now automatically saved in user_profiles table!**

The system has triple redundancy:
1. Database trigger (primary)
2. Signup fallback (secondary)
3. Login fallback (tertiary)

Your users will always have profiles! 🚀
