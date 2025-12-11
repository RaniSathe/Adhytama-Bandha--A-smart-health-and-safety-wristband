// Authentication utilities and helpers
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client for authentication
export function createClientComponentClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Server-side Supabase client with cookie handling for SSR
export function createServerComponentClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Get current user session
export async function getUser() {
  const supabase = createClientComponentClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return user;
}

// Sign up new user
export async function signUp(email, password, fullName) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  });
  
  // If signup successful, ensure profile is created (backup to trigger)
  if (data?.user && !error) {
    try {
      // Check if profile already exists (trigger may have created it)
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      // If no profile exists, create it manually
      if (!existingProfile) {
        console.log('📝 Creating user profile manually...');
        await supabase
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
            }
          ]);
        console.log('✅ User profile created successfully');
      } else {
        console.log('✅ User profile already exists (created by trigger)');
      }
    } catch (profileError) {
      console.warn('⚠️ Could not verify/create user profile:', profileError);
      // Don't fail the signup if profile creation fails
    }
  }
  
  return { data, error };
}

// Sign in user
export async function signIn(email, password) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  // After successful login, ensure profile exists
  if (data?.user && !error) {
    try {
      await ensureUserProfile(data.user);
    } catch (profileError) {
      console.warn('⚠️ Could not verify user profile on login:', profileError);
    }
  }
  
  return { data, error };
}

// Helper function to ensure user profile exists
async function ensureUserProfile(user) {
  const supabase = createClientComponentClient();
  
  // Check if profile exists
  const { data: existingProfile, error: checkError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  
  if (checkError) {
    console.warn('⚠️ Error checking profile:', checkError);
    return;
  }
  
  // If no profile exists, create it
  if (!existingProfile) {
    console.log('📝 Creating missing user profile on login...');
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        }
      ]);
    
    if (insertError) {
      console.warn('⚠️ Could not create user profile:', insertError);
    } else {
      console.log('✅ User profile created on login');
    }
  }
}

// Sign out user
export async function signOut() {
  const supabase = createClientComponentClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Check if user is authenticated
export async function isAuthenticated() {
  const supabase = createClientComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}
