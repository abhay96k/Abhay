import { createClient } from '@supabase/supabase-js';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase client if credentials are configured
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Saves a contact message to Supabase database (`messages` table).
 * Returns true if successful, false otherwise.
 */
export async function saveMessageToSupabase(data: ContactMessage): Promise<boolean> {
  // Option A: Official SDK client
  if (supabase) {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            status: 'unread',
            created_at: new Date().toISOString(),
          },
        ]);

      if (!error) return true;
      console.error('Supabase SDK Insert Error:', error);
    } catch (err) {
      console.error('Supabase SDK Connection Exception:', err);
    }
  }

  // Option B: Direct REST API fetch fallback if URL/Key set
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          status: 'unread',
          created_at: new Date().toISOString(),
        }),
      });

      return res.ok;
    } catch (err) {
      console.error('Supabase REST Fetch Error:', err);
    }
  }

  return false;
}
