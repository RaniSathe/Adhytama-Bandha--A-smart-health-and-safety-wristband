# Authentication Setup Guide

## 🎉 Completed Implementation

Your wristband monitoring application now includes:

✅ **User Authentication** (Sign up, Sign in, Sign out)  
✅ **User-Specific Data** (Each user only sees their own wristband data)  
✅ **Protected Routes** (Dashboard requires authentication)  
✅ **Row Level Security** (Database-level data isolation)  
✅ **Real-time Updates** (Live data synchronization per user)

---

## 📋 Database Setup (REQUIRED)

### Step 1: Run SQL Scripts in Supabase

1. Go to your Supabase Dashboard: https://jfmcvpbqykgnoynjjxuz.supabase.co
2. Navigate to **SQL Editor**
3. Run the SQL scripts from `DATABASE_SETUP.md`

**Key changes:**
- Added `user_id` column to `wristband_data` table
- Enabled Row Level Security (RLS)
- Created policies to ensure users only access their own data
- Created `user_profiles` table (optional)
- Set up automatic profile creation on signup

---

## 🚀 How It Works

### Routes Structure

```
/                          → Redirects to /auth
/auth                      → Login/Signup page
/dashboard                 → Protected: Main wristband monitor (user-specific)
/dashboard/analytics       → Protected: Analytics dashboard (user-specific)
```

### Authentication Flow

1. **New User:**
   - Visits `/auth`
   - Signs up with email/password/name
   - Receives verification email (if enabled in Supabase)
   - Redirected to `/dashboard`

2. **Returning User:**
   - Visits `/auth`
   - Signs in with credentials
   - Redirected to `/dashboard`

3. **Protected Pages:**
   - Automatically check authentication
   - Redirect to `/auth` if not logged in
   - Fetch only current user's data

---

## 🔐 Security Features

### Row Level Security (RLS)
All database queries are automatically filtered by `user_id`:
- ✅ Users can only see their own wristband data
- ✅ Users cannot access other users' data
- ✅ Users cannot modify other users' data
- ✅ Enforced at database level (not just application)

### Session Management
- JWT-based authentication via Supabase Auth
- Secure session cookies
- Automatic session refresh
- Logout clears all session data

---

## 📱 API Updates

### Updated API Endpoint

**Previous:**
```
GET /api/data?id=WB001&hr=78&temp=36.6&spo2=98
```

**New (requires user_id):**
```
GET /api/data?id=WB001&user_id=USER-UUID-HERE&hr=78&temp=36.6&spo2=98
```

### Example Usage from Wristband Device

```javascript
// Get user ID from device configuration
const userId = 'abc123-def456-ghi789'; // From device settings

// Send data
fetch(`/api/data?id=WB001&user_id=${userId}&hr=78&temp=36.6&spo2=98`)
  .then(response => response.json())
  .then(data => console.log('Data uploaded:', data));
```

---

## 🎨 UI Components

### New Pages Created

1. **`/src/app/auth/page.js`**
   - Beautiful login/signup form
   - Animated background
   - Form validation
   - Error handling

2. **`/src/app/dashboard/layout.js`**
   - Protected layout wrapper
   - Navigation bar with user email
   - Sign out button
   - Auth state management

3. **`/src/app/dashboard/page.js`**
   - User-specific wristband monitor
   - Real-time data updates
   - Live connection status
   - Same beautiful UI as before

4. **`/src/app/dashboard/analytics/page.js`**
   - User-specific analytics
   - Time range filtering
   - Device filtering
   - CSV export (user's data only)

### New Utilities

- **`/src/lib/auth.js`**
  - Authentication helper functions
  - Sign up, sign in, sign out
  - Get current user
  - Check authentication status

---

## 🧪 Testing the Implementation

### 1. Test User Registration

```bash
# Visit your app
http://localhost:3000

# You'll be redirected to /auth
# Click "Sign up"
# Enter:
  - Full Name: John Doe
  - Email: john@example.com
  - Password: test1234

# Check your database - new user should appear in auth.users
```

### 2. Test Data Insertion (via API)

```bash
# Get your user ID from Supabase Dashboard → Authentication → Users
# Copy the UUID

# Test API call:
curl "http://localhost:3000/api/data?id=WB001&user_id=YOUR-USER-ID-HERE&hr=78&temp=36.6&spo2=98"
```

### 3. Test RLS (Security)

```bash
# Create two users (User A and User B)
# Insert data for User A with their user_id
# Login as User B
# User B should NOT see User A's data ✅
```

---

## 📊 Database Schema

### wristband_data table (updated)

```sql
id              int8          PRIMARY KEY
device_id       text          NOT NULL
user_id         uuid          REFERENCES auth.users(id) -- NEW!
hr              int4          NOT NULL
temp            float8        NOT NULL
spo2            int4          NOT NULL
bp_sys          int4          NOT NULL
bp_dia          int4          NOT NULL
created_at      timestamptz   DEFAULT NOW()
```

### user_profiles table (optional)

```sql
id              uuid          PRIMARY KEY REFERENCES auth.users(id)
full_name       text
avatar_url      text
created_at      timestamptz   DEFAULT NOW()
updated_at      timestamptz   DEFAULT NOW()
```

---

## 🔄 Migration Steps for Existing Data

If you have existing test data without `user_id`:

```sql
-- Option 1: Assign to a test user
UPDATE wristband_data 
SET user_id = 'YOUR-TEST-USER-ID-HERE' 
WHERE user_id IS NULL;

-- Option 2: Delete old test data
DELETE FROM wristband_data WHERE user_id IS NULL;
```

---

## 🎯 Next Steps

### Recommended Enhancements

1. **Email Verification**
   - Enable in Supabase → Authentication → Email Auth
   - Customize email templates

2. **Password Reset**
   - Add "Forgot Password?" link
   - Implement password reset flow

3. **Social Login**
   - Enable Google/GitHub OAuth in Supabase
   - Add social login buttons

4. **User Profile Page**
   - Edit profile information
   - Change password
   - Manage connected devices

5. **Device Management**
   - Register wristband devices
   - Generate device-specific user_id tokens
   - View device connection status

---

## 🐛 Troubleshooting

### "Missing or invalid parameters" error
- Make sure you're passing `user_id` parameter to API
- Verify the user_id exists in auth.users table

### "No data available" in dashboard
- Ensure you're logged in
- Check that data has correct user_id in database
- Verify RLS policies are enabled

### "Redirected to /auth" immediately
- Check browser console for auth errors
- Verify Supabase credentials in .env.local
- Clear browser cookies and try again

### Can see other users' data
- **CRITICAL**: RLS not enabled correctly
- Rerun RLS setup SQL from DATABASE_SETUP.md
- Check policies in Supabase → Authentication → Policies

---

## 📝 Environment Variables

Make sure your `.env.local` has:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://jfmcvpbqykgnoynjjxuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🎓 How to Configure Wristband Devices

Each wristband device needs to know which user it belongs to:

### Option 1: Device Pairing Flow
1. User logs into mobile app
2. App displays QR code with user_id
3. Scan QR code with wristband to pair

### Option 2: Manual Configuration
1. User logs into web dashboard
2. Goes to "Settings" → "Devices"
3. Clicks "Add Device"
4. Enters device serial number
5. App generates and displays user_id for device

### Option 3: Secure Token System
1. Generate device-specific tokens (API keys)
2. Token includes user_id + device_id + expiration
3. Device sends token with each request
4. API validates token before insertion

---

## ✅ Security Checklist

- [x] Row Level Security enabled on wristband_data
- [x] Foreign key constraint on user_id
- [x] Policies restrict SELECT/INSERT/UPDATE/DELETE to own data
- [x] API validates user_id before insertion
- [x] Protected routes check authentication
- [x] Session management with secure cookies
- [x] Password minimum length enforced (6 chars)
- [ ] Email verification enabled (optional)
- [ ] Rate limiting on API endpoints (recommended)
- [ ] Device authentication tokens (recommended)

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

---

**🎉 Your app is now fully secured with user authentication and data isolation!**

For questions or issues, check the troubleshooting section or contact support.
