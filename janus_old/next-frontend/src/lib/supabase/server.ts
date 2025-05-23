import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3001';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_default_anon_key';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );
}