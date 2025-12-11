# 🔒 Security Documentation

## Overview

This document outlines the security measures implemented in the Multi-Waist Wristband Monitoring System, known vulnerabilities, and recommendations for production deployment.

---

## ✅ Implemented Security Features

### 1. Database Security

#### Row Level Security (RLS)
All tables have RLS policies enabled:

**`wristband_data`:**
```sql
-- Users can only read their own data
CREATE POLICY "Users can view own wristband data"
  ON wristband_data FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own data
CREATE POLICY "Users can insert own wristband data"
  ON wristband_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**`user_profiles`:**
```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

**`volunteers`:**
```sql
-- Allow read for authentication (email lookup)
CREATE POLICY "Allow read for auth" 
  ON volunteers FOR SELECT
  USING (true);

-- Only volunteers can update their own data
CREATE POLICY "Volunteers can update own data"
  ON volunteers FOR UPDATE
  USING (auth.uid() = id);
```

#### Foreign Key Constraints
```sql
ALTER TABLE wristband_data
  ADD CONSTRAINT wristband_data_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
```

### 2. Authentication Security

#### User Authentication (Supabase Auth)
- ✅ **Email/password authentication**
- ✅ **Secure session management** (JWT tokens)
- ✅ **Password hashing** (bcrypt via Supabase)
- ✅ **Session expiry** (configurable in Supabase)
- ✅ **HTTPS enforcement** (via Supabase)
- ✅ **Rate limiting** (via Supabase)

#### Auto Profile Creation
- ✅ **Database trigger** creates profile on signup
- ✅ **Application fallback** if trigger fails (signup)
- ✅ **Login fallback** checks and creates missing profiles
- ✅ **No email duplication** (stored only in auth.users)

### 3. Application Security

#### Protected Routes
```javascript
// Middleware checks authentication
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  router.push('/auth');
}
```

#### Client-Side Data Isolation
```javascript
// User dashboard - only fetches user's own data
const { data, error } = await supabase
  .from('wristband_data')
  .select('*')
  .eq('user_id', user.id); // RLS enforces this
```

#### Input Validation
- Form validation on signup/login
- Email format validation
- Password strength requirements
- Sanitized user inputs

### 4. Data Integrity

#### Cascade Deletes
```sql
-- If user deleted, all their data deleted
ON DELETE CASCADE
```

#### Timestamps
```sql
-- Automatic timestamp tracking
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

#### Unique Constraints
```sql
-- Prevent duplicate volunteer emails
email TEXT UNIQUE
```

---

## ⚠️ Known Security Issues (CRITICAL)

### 🚨 ISSUE #1: Volunteer Authentication - Client-Side Hashing

**Status:** ⚠️ **NOT PRODUCTION-READY**

**Current Implementation:**
```javascript
// volunteerAuth.js (CLIENT-SIDE)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

**Problems:**
1. ❌ **Password hashed in browser** (visible in network tab)
2. ❌ **No salt** (vulnerable to rainbow table attacks)
3. ❌ **SHA-256 not designed for passwords** (too fast, enables brute force)
4. ❌ **No rate limiting** on volunteer login attempts
5. ❌ **Session in localStorage** (vulnerable to XSS)

**Risk Level:** 🔴 **HIGH** - Do not use in production!

---

## ✅ Production Security Fixes (Required)

### FIX #1: Server-Side Volunteer Authentication

**Step 1: Create API Route for Signup**

Create `src/app/api/volunteer/signup/route.js`:

```javascript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { name, email, password } = await request.json();
  
  // Validate input
  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }
  
  // Password strength validation
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }
  
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check if email exists
  const { data: existing } = await supabase
    .from('volunteers')
    .select('id')
    .eq('email', email)
    .single();
    
  if (existing) {
    return NextResponse.json(
      { error: 'Email already registered' },
      { status: 409 }
    );
  }
  
  // Hash password server-side (SECURE)
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  
  // Insert volunteer
  const { data, error } = await supabase
    .from('volunteers')
    .insert({
      name,
      email,
      password_hash: passwordHash,
      is_active: true,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
  
  // Create secure session (JWT or cookie)
  const session = {
    volunteerId: data.id,
    email: data.email,
    name: data.name,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  
  return NextResponse.json({ 
    success: true, 
    volunteer: {
      id: data.id,
      name: data.name,
      email: data.email
    }
  });
}
```

**Step 2: Create API Route for Login**

Create `src/app/api/volunteer/login/route.js`:

```javascript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { email, password } = await request.json();
  
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Missing credentials' },
      { status: 400 }
    );
  }
  
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get volunteer by email
  const { data: volunteer, error } = await supabase
    .from('volunteers')
    .select('*')
    .eq('email', email)
    .single();
    
  if (error || !volunteer) {
    // Generic error to prevent email enumeration
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
  
  // Compare password (SECURE)
  const match = await bcrypt.compare(password, volunteer.password_hash);
  
  if (!match) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
  
  // Update last login
  await supabase
    .from('volunteers')
    .update({ last_login: new Date().toISOString() })
    .eq('id', volunteer.id);
  
  // Create secure session
  return NextResponse.json({
    success: true,
    volunteer: {
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email
    }
  });
}
```

**Step 3: Update Client-Side Code**

Update `src/lib/volunteerAuth.js`:

```javascript
export async function volunteerSignUp(name, email, password) {
  const response = await fetch('/api/volunteer/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Signup failed');
  }
  
  // Store session securely (use httpOnly cookie in production)
  localStorage.setItem('volunteer_session', JSON.stringify(data.volunteer));
  
  return { data: data.volunteer, error: null };
}

export async function volunteerSignIn(email, password) {
  const response = await fetch('/api/volunteer/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  
  localStorage.setItem('volunteer_session', JSON.stringify(data.volunteer));
  
  return { data: data.volunteer, error: null };
}
```

---

### FIX #2: Use HTTP-Only Cookies Instead of localStorage

**Why:** LocalStorage is vulnerable to XSS attacks.

**Solution:** Use HTTP-only cookies for session storage.

Update API routes to use cookies:

```javascript
import { cookies } from 'next/headers';

// After successful login/signup
cookies().set('volunteer_session', JSON.stringify(session), {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 // 24 hours
});
```

---

### FIX #3: Add Rate Limiting

Install rate limiting package:

```bash
npm install rate-limiter-flexible
```

Add to API routes:

```javascript
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 60 * 15, // per 15 minutes
});

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    await rateLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429 }
    );
  }
  
  // ... rest of auth logic
}
```

---

### FIX #4: Enable Supabase Email Verification

In Supabase Dashboard:
1. Go to **Authentication** → **Settings**
2. Enable **"Confirm email"**
3. Configure email templates
4. Users must verify email before accessing app

Update signup flow:

```javascript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  }
});

// Show message: "Check your email to verify your account"
```

---

### FIX #5: Add CSRF Protection

Install CSRF package:

```bash
npm install csrf
```

Add to API routes:

```javascript
import csrf from 'csrf';

const tokens = new csrf();

// Generate token (send to client)
const secret = await tokens.secret();
const token = tokens.create(secret);

// Verify token (in API route)
const isValid = tokens.verify(secret, token);
if (!isValid) {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
}
```

---

## 🔐 Additional Security Recommendations

### 1. Environment Variables
```env
# Never commit these!
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-side only
JWT_SECRET=xxx  # For volunteer sessions
```

### 2. Content Security Policy (CSP)

Add to `next.config.mjs`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

### 3. Secure Password Requirements

```javascript
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength) {
    return 'Password must be at least 8 characters';
  }
  if (!hasUpperCase) {
    return 'Password must contain uppercase letter';
  }
  if (!hasLowerCase) {
    return 'Password must contain lowercase letter';
  }
  if (!hasNumbers) {
    return 'Password must contain number';
  }
  if (!hasSpecialChar) {
    return 'Password must contain special character';
  }
  
  return null; // Valid
}
```

### 4. SQL Injection Prevention

**✅ Current:** Using Supabase client (parameterized queries)

```javascript
// SAFE - Supabase handles parameterization
await supabase
  .from('wristband_data')
  .select('*')
  .eq('user_id', userId);
```

**❌ Never do this:**
```javascript
// UNSAFE - Raw SQL concatenation
await supabase.rpc('raw_query', {
  sql: `SELECT * FROM wristband_data WHERE user_id = '${userId}'`
});
```

### 5. XSS Prevention

**✅ React handles this automatically** by escaping user inputs.

**Be careful with:**
```javascript
// UNSAFE
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// SAFE
<div>{userInput}</div>
```

### 6. Logging & Monitoring

Log security events:

```javascript
// Failed login attempts
console.warn(`Failed login attempt for: ${email} from IP: ${ip}`);

// Suspicious activity
console.error(`Multiple failed logins for: ${email}`);

// Successful sensitive operations
console.info(`Profile updated for user: ${userId}`);
```

Use Supabase logs:
- Go to Supabase Dashboard → Logs
- Monitor authentication events
- Set up alerts for suspicious activity

---

## 📋 Security Checklist

Before deploying to production, verify:

### Critical (Must Have)
- [ ] Volunteer auth moved to server-side API routes
- [ ] Password hashing uses bcrypt with 10+ salt rounds
- [ ] Sessions use HTTP-only cookies (not localStorage)
- [ ] Rate limiting on login endpoints
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] Environment variables not in git
- [ ] RLS policies tested and working
- [ ] Email verification enabled (optional but recommended)

### Important (Should Have)
- [ ] CSRF protection added
- [ ] Content Security Policy headers
- [ ] Strong password requirements
- [ ] Session expiry implemented
- [ ] Logging for security events
- [ ] Error messages don't leak info ("Invalid credentials" not "Email not found")

### Nice to Have
- [ ] 2FA for volunteers
- [ ] IP whitelist for admin functions
- [ ] Audit trail for sensitive operations
- [ ] Automated security scanning (Snyk, Dependabot)
- [ ] Regular security reviews

---

## 🚨 Incident Response

If a security breach occurs:

1. **Immediately:**
   - Revoke all active sessions
   - Reset Supabase anon key
   - Change all passwords

2. **Within 24 hours:**
   - Investigate breach vector
   - Notify affected users
   - Document findings

3. **Within 1 week:**
   - Implement fixes
   - Conduct security audit
   - Update this document

---

## 📞 Security Contact

For security issues, please:
1. **Do NOT** open a public GitHub issue
2. Email: security@your-domain.com
3. Allow 48 hours for response

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [bcrypt Best Practices](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns)

---

**Last Updated:** 2025  
**Status:** ⚠️ Known issues documented, fixes provided
