'use server';

import { createServerSupabaseClient } from '../supabase/server';
import { redirect } from 'next/navigation';

/**
 * Server action to sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: {
    full_name?: string;
    company_name?: string;
    company_type?: string;
    phone?: string;
    address?: string;
    is_superadmin?: boolean;
  }
) {
  const supabase = createServerSupabaseClient();
  
  // Start a transaction
  const { data: companyData, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: metadata?.company_name,
      address: metadata?.address,
      phone: metadata?.phone,
      email,
      company_type: metadata?.company_type,
    })
    .select('id')
    .single();

  if (companyError) {
    return { error: companyError.message };
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      company_id: companyData.id,
      name: metadata?.full_name,
      email,
      password_hash: '', // You should hash the password before storing it
      phone: metadata?.phone,
      is_active: true,
    })
    .select('id')
    .single();

  if (userError) {
    return { error: userError.message };
  }

  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  return { success: true, message: 'Check your email to confirm your account' };
}

/**
 * Server action to sign in a user
 */
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = createServerSupabaseClient();
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

/**
 * Server action to sign out a user
 */
export async function signOut() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/');
}

/**
 * Server action to reset password
 */
export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string;

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  const supabase = createServerSupabaseClient();
  
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Server action to request password reset
 */
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required' };
  }

  const supabase = createServerSupabaseClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Get the current session (for use in Server Components)
 */
export async function getSession() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the current user (for use in Server Components)
 */
export async function getUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Update a user's auth_user_id in the database
 */
export async function updateUserAuthId(userId: number, authUserId: string) 