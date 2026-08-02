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
 * Helper to get local fallback messages
 */
function getLocalMessages(): SavedMessage[] {
  try {
    const raw = localStorage.getItem('abhay_portfolio_messages');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Helper to save local fallback message
 */
function saveLocalMessage(msg: SavedMessage) {
  try {
    const existing = getLocalMessages();
    const updated = [msg, ...existing.filter((m) => m.id !== msg.id)];
    localStorage.setItem('abhay_portfolio_messages', JSON.stringify(updated));
  } catch (err) {
    console.error('LocalStorage Save Error:', err);
  }
}

/**
 * Saves a contact message to Supabase database (`messages` table) and local backup.
 * Returns true if successful, false otherwise.
 */
export async function saveMessageToSupabase(data: ContactMessage): Promise<boolean> {
  const newMsg: SavedMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    status: 'unread',
    created_at: new Date().toISOString(),
  };

  // Always save to local backup so admin dashboard can display it immediately
  saveLocalMessage(newMsg);

  let success = false;

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
            created_at: newMsg.created_at,
          },
        ]);

      if (!error) success = true;
      else console.error('Supabase SDK Insert Error:', error);
    } catch (err) {
      console.error('Supabase SDK Connection Exception:', err);
    }
  }

  if (!success && supabaseUrl && supabaseAnonKey) {
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
          created_at: newMsg.created_at,
        }),
      });

      if (res.ok) success = true;
    } catch (err) {
      console.error('Supabase REST Fetch Error:', err);
    }
  }

  return true;
}

/**
 * Fetches all saved messages from Supabase (`messages` table) combined with local backup.
 */
export async function fetchMessagesFromSupabase(): Promise<SavedMessage[]> {
  let remoteMessages: SavedMessage[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) remoteMessages = data as SavedMessage[];
      else console.error('Supabase Fetch Error:', error);
    } catch (err) {
      console.error('Supabase Fetch Exception:', err);
    }
  }

  if (remoteMessages.length === 0 && supabaseUrl && supabaseAnonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/messages?select=*&order=created_at.desc`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        remoteMessages = data as SavedMessage[];
      }
    } catch (err) {
      console.error('Supabase REST Fetch Error:', err);
    }
  }

  // Combine remote Supabase messages with local backup (deduplicated)
  const localMessages = getLocalMessages();
  const combinedMap = new Map<string, SavedMessage>();

  localMessages.forEach((m) => combinedMap.set(m.email + m.created_at, m));
  remoteMessages.forEach((m) => combinedMap.set(m.email + m.created_at, m));

  const allMessages = Array.from(combinedMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return allMessages;
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
