// Volunteer Authentication Utilities
import { createClientComponentClient } from './auth';
import bcrypt from 'bcryptjs';

// Note: Password hashing should be done server-side for security
// For now, we'll use a simple hash client-side (NOT RECOMMENDED FOR PRODUCTION)

// Sign up new volunteer
export async function volunteerSignUp(name, email, password) {
  const supabase = createClientComponentClient();
  
  try {
    // Hash password (in production, this should be done server-side)
    const passwordHash = await hashPassword(password);
    
    const { data, error } = await supabase
      .from('volunteers')
      .insert([
        {
          name,
          email,
          password_hash: passwordHash,
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    // Store volunteer session in localStorage
    if (data) {
      localStorage.setItem('volunteer_session', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        loginTime: new Date().toISOString()
      }));
    }
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Sign in volunteer
export async function volunteerSignIn(email, password) {
  const supabase = createClientComponentClient();
  
  try {
    // Get volunteer by email
    const { data: volunteer, error: fetchError } = await supabase
      .from('volunteers')
      .select('*')
      .eq('email', email)
      .single();
    
    if (fetchError) throw new Error('Invalid email or password');
    if (!volunteer) throw new Error('Invalid email or password');
    if (!volunteer.is_active) throw new Error('Account is deactivated');
    
    // Verify password
    const isValid = await verifyPassword(password, volunteer.password_hash);
    if (!isValid) throw new Error('Invalid email or password');
    
    // Update last login
    await supabase
      .from('volunteers')
      .update({ last_login: new Date().toISOString() })
      .eq('id', volunteer.id);
    
    // Store volunteer session in localStorage
    localStorage.setItem('volunteer_session', JSON.stringify({
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      loginTime: new Date().toISOString()
    }));
    
    return { data: volunteer, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Sign out volunteer
export function volunteerSignOut() {
  localStorage.removeItem('volunteer_session');
  return { error: null };
}

// Get current volunteer session
export function getVolunteerSession() {
  if (typeof window === 'undefined') return null;
  
  const session = localStorage.getItem('volunteer_session');
  if (!session) return null;
  
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

// Check if volunteer is authenticated
export function isVolunteerAuthenticated() {
  return getVolunteerSession() !== null;
}

// Simple password hashing (CLIENT-SIDE - NOT SECURE FOR PRODUCTION)
// In production, use server-side API route with proper bcrypt
async function hashPassword(password) {
  // Simple hash for demo - in production use server-side bcrypt
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Simple password verification
async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Get all users assigned to volunteer
export async function getVolunteerAssignments(volunteerId) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('volunteer_user_assignments')
    .select(`
      *,
      user:user_id (
        id,
        email
      )
    `)
    .eq('volunteer_id', volunteerId);
  
  return { data, error };
}

// Assign volunteer to user
export async function assignVolunteerToUser(volunteerId, userId, notes = '') {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('volunteer_user_assignments')
    .insert([
      {
        volunteer_id: volunteerId,
        user_id: userId,
        notes
      }
    ])
    .select()
    .single();
  
  return { data, error };
}

// Remove volunteer assignment
export async function removeVolunteerAssignment(volunteerId, userId) {
  const supabase = createClientComponentClient();
  
  const { error } = await supabase
    .from('volunteer_user_assignments')
    .delete()
    .eq('volunteer_id', volunteerId)
    .eq('user_id', userId);
  
  return { error };
}
