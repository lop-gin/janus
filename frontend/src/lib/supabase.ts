import { createClient } from '@supabase/supabase-js';

// These environment variables will be set in the .env.local file
// For development, we'll use placeholder values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'abcd';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for authentication
export type SignUpCredentials = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  companyType: 'manufacturer' | 'distributor' | 'both';
};

export type SignInCredentials = {
  email: string;
  password: string;
};

// Authentication helper functions
export async function signUp(credentials: SignUpCredentials) {
  const { email, password, firstName, lastName, companyName, companyType } = credentials;
  
  // 1. Sign up the user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  });
  
  if (authError) throw authError;
  
  // 2. Create a new company
  const { data: companyData, error: companyError } = await supabase
    .from('companies')
    .insert([
      { 
        name: companyName, 
        company_type: companyType,
        email: email
      }
    ])
    .select()
    .single();
  
  if (companyError) throw companyError;
  
  // 3. Update the user profile with company ID
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: authData.user?.id,
        company_id: companyData.id,
        first_name: firstName,
        last_name: lastName,
        email: email
      }
    ]);
  
  if (profileError) throw profileError;
  
  // 4. Assign the Owner role to the user
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'Owner')
    .single();
  
  if (roleError) throw roleError;
  
  const { error: userRoleError } = await supabase
    .from('user_roles')
    .insert([
      {
        user_id: authData.user?.id,
        role_id: roleData.id
      }
    ]);
  
  if (userRoleError) throw userRoleError;
  
  return { user: authData.user, company: companyData };
}

export async function signIn(credentials: SignInCredentials) {
  const { email, password } = credentials;
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
  });
  
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) throw error;
  
  if (!session) return null;
  
  // Get the user profile with company information
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      *,
      companies:company_id (*)
    `)
    .eq('id', session.user.id)
    .single();
  
  if (profileError) throw profileError;
  
  // Get user roles
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select(`
      roles:role_id (
        id,
        name,
        description
      )
    `)
    .eq('user_id', session.user.id);
  
  if (rolesError) throw rolesError;
  
  return {
    ...session.user,
    profile,
    roles: userRoles.map(ur => ur.roles)
  };
}

export async function inviteUser(email: string, roleId: string, companyId: string) {
  // Generate a unique token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Create an invitation
  const { data, error } = await supabase
    .from('invitations')
    .insert([
      {
        company_id: companyId,
        email,
        role_id: roleId,
        invited_by: user?.id,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      }
    ])
    .select()
    .single();
  
  if (error) throw error;
  
  // In a real application, you would send an email with the invitation link
  // For now, we'll just return the token
  return {
    invitationId: data.id,
    token,
    invitationLink: `${window.location.origin}/accept-invitation?token=${token}`
  };
}

export async function acceptInvitation(token: string, password: string, firstName: string, lastName: string) {
  // 1. Get the invitation
  const { data: invitation, error: invitationError } = await supabase
    .from('invitations')
    .select(`
      *,
      companies:company_id (*)
    `)
    .eq('token', token)
    .single();
  
  if (invitationError) throw invitationError;
  
  // Check if invitation is expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation has expired');
  }
  
  // 2. Create a new user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: invitation.email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  });
  
  if (authError) throw authError;
  
  // 3. Create a profile for the user
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: authData.user?.id,
        company_id: invitation.company_id,
        first_name: firstName,
        last_name: lastName,
        email: invitation.email
      }
    ]);
  
  if (profileError) throw profileError;
  
  // 4. Assign the role to the user
  const { error: userRoleError } = await supabase
    .from('user_roles')
    .insert([
      {
        user_id: authData.user?.id,
        role_id: invitation.role_id
      }
    ]);
  
  if (userRoleError) throw userRoleError;
  
  // 5. Mark the invitation as accepted
  const { error: updateError } = await supabase
    .from('invitations')
    .update({ accepted: true })
    .eq('id', invitation.id);
  
  if (updateError) throw updateError;
  
  return { user: authData.user, company: invitation.companies };
}
