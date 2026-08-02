import { createClient } from '@supabase/supabase-js';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SavedMessage extends ContactMessage {
  id: string;
  created_at: string;
  status: 'read' | 'unread';
}

const DEFAULT_SUPABASE_URL = 'https://dcupywuwyewseskrixcx.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_aQ9ZynADnxtXuIatPQwsVw_sdiJu4qW';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;

// Initialize Supabase client if credentials are configured
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Saves a contact message to Supabase database (`messages` table).
 * Returns true if successful, false otherwise.
 */
export async function saveMessageToSupabase(data: ContactMessage): Promise<boolean> {
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

/**
 * Fetches all saved messages from Supabase (`messages` table).
 */
export async function fetchMessagesFromSupabase(): Promise<SavedMessage[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return data as SavedMessage[];
      console.error('Supabase Fetch Error:', error);
    } catch (err) {
      console.error('Supabase Fetch Exception:', err);
    }
  }

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/messages?select=*&order=created_at.desc`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        return data as SavedMessage[];
      }
    } catch (err) {
      console.error('Supabase REST Fetch Error:', err);
    }
  }

  return [];
}

/**
 * Deletes a message by ID from Supabase (`messages` table).
 */
export async function deleteMessageFromSupabase(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (!error) return true;
    } catch (err) {
      console.error('Supabase Delete Error:', err);
    }
  }

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/messages?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });
      return res.ok;
    } catch (err) {
      console.error('Supabase REST Delete Error:', err);
    }
  }

  return false;
}

/**
 * Updates message status ('read' or 'unread') in Supabase.
 */
export async function updateMessageStatusInSupabase(id: string, status: 'read' | 'unread'): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', id);

      if (!error) return true;
    } catch (err) {
      console.error('Supabase Update Error:', err);
    }
  }

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/messages?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ status }),
      });
      return res.ok;
    } catch (err) {
      console.error('Supabase REST Update Error:', err);
    }
  }

  return false;
}
