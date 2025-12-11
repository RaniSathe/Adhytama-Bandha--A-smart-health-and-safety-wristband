# 👤 User Profile Feature - Complete Setup Guide

## 📋 Overview

The user profile feature allows users to manage comprehensive information including:
- ✅ **Personal Info:** Name, Age, Gender, Blood Group, Height, Weight, BMI
- ✅ **Medical Info:** Existing diseases, Medications, Allergies, Family history
- ✅ **Lifestyle:** Smoking, Alcohol, Diet, Exercise, Sleep
- ✅ **Contact/Demographic:** Address, Occupation, Region

## 🚀 Setup Instructions

### Step 1: Update Database Schema

Run this SQL script in Supabase SQL Editor:

```bash
File: ADD_PROFILE_FIELDS.sql
```

This adds all the new profile fields to the `user_profiles` table.

### Step 2: Verify Database Changes

After running the SQL, verify in Supabase:

1. Go to **Table Editor** → `user_profiles`
2. You should see new columns:
   - `age`, `blood_group`, `height`, `weight`
   - `existing_diseases`, `medications`, `allergies`, `family_history`
   - `smoking`, `alcohol`, `diet`, `exercise`, `sleep_hours`
   - `occupation`, `region`

## 📍 Access the Profile Page

### From Dashboard:
1. Login to your account
2. Go to `/dashboard`
3. Click the **"My Profile"** button (purple button at top-right)
4. Or directly visit: `http://localhost:3000/dashboard/profile`

## 🎨 Features

### 1. **Automatic BMI Calculation**
- Enter height (cm) and weight (kg)
- BMI is automatically calculated
- Shows status badge: Underweight / Normal / Overweight

### 2. **Comprehensive Form Sections**

#### Personal Information:
- Full Name (required)
- Date of Birth
- Age
- Gender (dropdown)
- Blood Group (8 options)
- Height & Weight
- Auto-calculated BMI

#### Medical Information:
- Existing Diseases (textarea)
- Current Medications (textarea)
- Allergies (textarea)
- Family History (textarea)

#### Lifestyle:
- Smoking status (No / Yes / Former)
- Alcohol consumption (No / Occasional / Moderate / Heavy)
- Diet type (Vegetarian / Vegan / Non-vegetarian / Pescatarian)
- Exercise frequency (dropdown)
- Sleep hours per day

#### Contact & Demographic:
- Phone number
- Address
- City
- Region/State
- Country
- Occupation

### 3. **Real-time Save Feedback**
- Shows loading spinner while saving
- ✅ Success message when saved
- Auto-saves to Supabase database

### 4. **Data Persistence**
- All data is stored in `user_profiles` table
- Automatically loads existing profile data
- Updates are immediate

## 🔒 Security

### Row Level Security (RLS):
- ✅ Users can only view/edit their own profile
- ✅ Enforced at database level
- ✅ Cannot access other users' profiles

### Data Privacy:
- Email stored separately in `auth.users`
- Profile data linked via user ID
- Automatic cascade delete if user deleted

## 📊 Database Structure

### Table: `user_profiles`

```sql
CREATE TABLE user_profiles (
  -- Auth
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  
  -- Personal Info
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  blood_group TEXT,
  height NUMERIC(5,2),     -- in cm
  weight NUMERIC(5,2),     -- in kg
  date_of_birth DATE,
  
  -- Medical Info
  existing_diseases TEXT,
  medications TEXT,
  allergies TEXT,
  family_history TEXT,
  
  -- Lifestyle
  smoking TEXT DEFAULT 'no',
  alcohol TEXT DEFAULT 'no',
  diet TEXT,
  exercise TEXT,
  sleep_hours NUMERIC(3,1),
  
  -- Contact/Demographic
  phone TEXT,
  address TEXT,
  occupation TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  avatar_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🧪 Testing

### Test Flow:

1. **Login**
   ```
   Go to: http://localhost:3000/auth
   Login with your credentials
   ```

2. **Navigate to Profile**
   ```
   Click "Dashboard"
   Click "My Profile" button
   ```

3. **Fill Profile Data**
   ```
   Personal: Name, Age, Gender, Blood Group, Height, Weight
   Medical: Diseases, Medications, Allergies, Family History
   Lifestyle: Smoking, Alcohol, Diet, Exercise, Sleep
   Contact: Phone, Address, City, Country, Occupation
   ```

4. **Save Profile**
   ```
   Click "Save Profile" button
   Wait for success message: ✅ "Profile saved successfully!"
   ```

5. **Verify in Database**
   ```sql
   SELECT * FROM user_profiles 
   WHERE id = 'YOUR-USER-ID';
   ```

## 🎯 Use Cases

### For Patients:
- Track complete health information
- Provide accurate data to healthcare providers
- Update lifestyle changes over time

### For Healthcare Providers:
- Access comprehensive patient profiles
- View medical history at a glance
- Make informed decisions based on lifestyle data

### For Health Monitoring:
- Correlate wristband data with health profile
- Identify risk factors
- Personalize health recommendations

## 📱 Mobile Responsive

- ✅ Fully responsive design
- ✅ Works on mobile, tablet, desktop
- ✅ Touch-friendly inputs
- ✅ Optimized for small screens

## 🔄 Future Enhancements

Potential additions:
- [ ] Profile picture upload
- [ ] Medical document attachments
- [ ] Emergency contact information
- [ ] Insurance details
- [ ] Vaccination records
- [ ] Lab test results
- [ ] Export profile as PDF

## 🐛 Troubleshooting

### Profile not saving?
1. Check browser console for errors
2. Verify you're logged in
3. Check Supabase connection
4. Ensure RLS policies are correct

### Profile not loading?
1. Check if user profile exists in database
2. Run: `SELECT * FROM user_profiles WHERE id = auth.uid()`
3. If no profile, run Step 5 from `VERIFY_AND_FIX_USER_PROFILES.sql`

### Missing fields?
1. Verify database columns exist
2. Re-run `ADD_PROFILE_FIELDS.sql`
3. Check column names match form fields

## 📚 Related Files

- **Frontend:** `src/app/dashboard/profile/page.js`
- **SQL Migration:** `ADD_PROFILE_FIELDS.sql`
- **Database Setup:** `CREATE_USER_PROFILE_TABLE.sql`
- **Verification:** `VERIFY_AND_FIX_USER_PROFILES.sql`

## ✅ Checklist

- [ ] Run `ADD_PROFILE_FIELDS.sql` in Supabase
- [ ] Verify new columns in `user_profiles` table
- [ ] Test profile page access at `/dashboard/profile`
- [ ] Fill and save profile data
- [ ] Verify data saved in database
- [ ] Test BMI calculation
- [ ] Check success message appears
- [ ] Verify data persists on page reload

---

**🎉 Profile Feature Complete!**

Users can now manage comprehensive health and personal information! 🚀
