import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_default_anon_key';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);