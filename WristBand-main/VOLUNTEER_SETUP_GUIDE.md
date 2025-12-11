# 🩺 Volunteer Login & Dashboard Setup Guide

## 📋 Quick Setup (3 Steps)

### Step 1: Create Volunteer Table in Database (2 minutes)

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Copy and paste** everything from `CREATE_VOLUNTEER_TABLE.sql`
3. Click **"Run"** or press `Ctrl+Enter`
4. ✅ Volunteer table created with authentication!

---

### Step 2: Start Your Dev Server

```powershell
npm run dev
```

---

### Step 3: Access Volunteer Portal

**Volunteer Signup:** http://localhost:3000/volunteer/auth
**Volunteer Dashboard:** http://localhost:3000/volunteer/dashboard

---

## 🎯 Features Implemented

### ✅ Volunteer Authentication
- **Separate login system** from regular users
- Email + Password authentication
- Stored in `volunteers` table (not `auth.users`)
- Session management with localStorage

### ✅ Volunteer Dashboard
- **See ALL users' wristband data** in real-time
- Live monitoring of all connected devices
- Color-coded health indicators:
  - 🟢 Green = Normal
  - 🟡 Yellow = Warning
  - 🔴 Red = Critical
- Auto-refresh every 10 seconds
- Beautiful card-based layout

### ✅ Security
- Row Level Security (RLS) enabled
- Volunteers can only access through their portal
- Passwords hashed (Note: client-side hashing is demo only)
- Session-based authentication

---

## 🧪 Testing Instructions

### 1. Sign Up as Volunteer

1. Go to: http://localhost:3000/volunteer/auth
2. Click **"Sign up as volunteer"**
3. Enter:
   - Name: `Dr. Smith`
   - Email: `volunteer1@example.com`
   - Password: `password123`
4. Click **"Sign Up as Volunteer"**
5. ✅ You'll be redirected to volunteer dashboard

### 2. View Patient Data

- The dashboard will show all wristband data from ALL users
- Each card shows:
  - Patient ID (first 8 chars of user UUID)
  - Device ID
  - Real-time vitals: HR, Temp, SpO2, BP
  - Last update timestamp
- Data refreshes automatically every 10 seconds

### 3. Sign Out & Sign In

- Click **"Sign Out"** button in top right
- You'll be redirected to login page
- Sign in again with your email and password

---

## 📊 Database Structure

### `volunteers` Table
```
id (UUID) - Primary key
name (TEXT) - Volunteer's full name
email (TEXT) - Unique email (login credential)
password_hash (TEXT) - Hashed password
created_at (TIMESTAMPTZ) - Account creation
updated_at (TIMESTAMPTZ) - Last update
last_login (TIMESTAMPTZ) - Last login time
is_active (BOOLEAN) - Account status
```

### `volunteer_user_assignments` Table (For Future)
```
id (UUID) - Primary key
volunteer_id (UUID) - References volunteers
user_id (UUID) - References auth.users
assigned_at (TIMESTAMPTZ) - Assignment time
notes (TEXT) - Optional notes
```

---

## 🔐 How Authentication Works

### Volunteer Signup:
1. User fills form (name, email, password)
2. Password is hashed
3. Record inserted into `volunteers` table
4. Session stored in localStorage
5. Redirect to volunteer dashboard

### Volunteer Login:
1. User enters email + password
2. Fetch volunteer record by email
3. Verify password hash
4. Update `last_login` timestamp
5. Store session in localStorage
6. Redirect to volunteer dashboard

### Session Check:
1. Dashboard checks localStorage for session
2. If no session → redirect to `/volunteer/auth`
3. If session exists → show dashboard

---

## 🎨 Pages Created

### 1. `/volunteer/auth` (Login/Signup)
- **File:** `src/app/volunteer/auth/page.js`
- Toggle between login and signup
- Rose/pink theme (different from user portal)
- Form validation
- Error handling
- Link back to user login

### 2. `/volunteer/dashboard` (Patient Monitoring)
- **File:** `src/app/volunteer/dashboard/page.js`
- Shows ALL users' wristband data
- Real-time updates
- Color-coded health status
- Auto-refresh every 10 seconds
- Responsive grid layout

### 3. Auth Utilities
- **File:** `src/lib/volunteerAuth.js`
- `volunteerSignUp()` - Create account
- `volunteerSignIn()` - Login
- `volunteerSignOut()` - Logout
- `getVolunteerSession()` - Get current session
- `isVolunteerAuthenticated()` - Check auth status

---

## 🔍 Useful SQL Queries

### Check Volunteers
```sql
SELECT id, name, email, created_at, last_login, is_active
FROM volunteers
ORDER BY created_at DESC;
```

### Check Total Patients Being Monitored
```sql
SELECT COUNT(DISTINCT user_id) as total_patients
FROM wristband_data;
```

### Check Latest Data Per User
```sql
SELECT 
  user_id,
  device_id,
  hr, temp, spo2, bp_sys, bp_dia,
  created_at
FROM wristband_data
WHERE (user_id, device_id, created_at) IN (
  SELECT user_id, device_id, MAX(created_at)
  FROM wristband_data
  GROUP BY user_id, device_id
)
ORDER BY created_at DESC;
```

### Delete a Volunteer
```sql
DELETE FROM volunteers WHERE email = 'volunteer1@example.com';
```

---

## 🚨 Important Security Note

**⚠️ PRODUCTION WARNING:**

The current implementation uses **client-side password hashing** (SHA-256), which is **NOT SECURE for production**. 

### For Production, You MUST:

1. **Use Server-Side API Routes:**
   ```javascript
   // api/volunteer/signup/route.js
   import bcrypt from 'bcryptjs';
   
   export async function POST(request) {
     const { name, email, password } = await request.json();
     const hash = await bcrypt.hash(password, 10);
     // Insert into database with hash
   }
   ```

2. **Use Environment Variables** for sensitive keys
3. **Implement HTTPS** only
4. **Add rate limiting** to prevent brute force
5. **Use JWT tokens** instead of localStorage
6. **Add CSRF protection**
7. **Implement session expiry**

---

## 🎯 Next Steps (Optional Enhancements)

### 1. Assign Volunteers to Specific Users
```javascript
// In dashboard, add assignment feature
await assignVolunteerToUser(volunteerId, userId);
```

### 2. Add Alerts for Critical Vitals
```javascript
if (record.hr < 60 || record.hr > 100) {
  // Send alert to volunteer
  showNotification('Critical heart rate detected!');
}
```

### 3. Add Patient Details Page
```javascript
// /volunteer/patient/[userId]
// Show detailed history for specific patient
```

### 4. Add Analytics
- Daily patient count
- Average vitals per patient
- Alert history
- Volunteer activity logs

### 5. Add Real-Time Notifications
- Use Supabase Realtime subscriptions
- Alert volunteer when critical values detected
- Browser notifications API

---

## 🧪 Test Scenarios

### Scenario 1: Multiple Volunteers
1. Sign up 2-3 volunteers
2. Each can see all patient data
3. Each has their own session

### Scenario 2: No Patient Data
1. Sign in as volunteer
2. See "No Patient Data" message
3. Add some patient data (as regular user)
4. Refresh volunteer dashboard
5. ✅ Data should appear

### Scenario 3: Real-Time Updates
1. Keep volunteer dashboard open
2. Login as regular user in another browser/tab
3. Generate wristband data
4. ✅ Volunteer dashboard should update within 10 seconds

---

## 📞 Troubleshooting

### Issue: "Volunteer table not found"
**Solution:** Run `CREATE_VOLUNTEER_TABLE.sql` in Supabase SQL Editor

### Issue: "Cannot sign up - duplicate key"
**Solution:** Email already exists, try different email or login

### Issue: "No data showing on dashboard"
**Solution:** 
1. Check if any wristband_data exists in database
2. Login as regular user and add some data
3. Refresh volunteer dashboard

### Issue: "Redirects to login after refresh"
**Solution:** Session stored in localStorage, check browser console for errors

---

## ✅ Checklist

- [ ] Run `CREATE_VOLUNTEER_TABLE.sql` in Supabase
- [ ] Verify volunteer table exists in Supabase Table Editor
- [ ] Start dev server (`npm run dev`)
- [ ] Go to http://localhost:3000/volunteer/auth
- [ ] Sign up as volunteer
- [ ] Verify redirect to dashboard
- [ ] Check if patient data appears (if any exists)
- [ ] Test sign out/sign in
- [ ] Test with multiple volunteers

---

**🎉 Done! Volunteers can now monitor all patients' health data!**
