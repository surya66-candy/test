import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('https://');

if (!isConfigured) {
  console.warn(
    '⚠️ Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

// Create a mock client for when Supabase is not configured
const createMockClient = () => {
  const noop = () => ({ data: null, error: null, count: 0 });
  const chainable = () =>
    new Proxy(
      {},
      {
        get: () => (..._args) => {
          // Return a chainable that eventually resolves
          const chain = new Proxy(
            {},
            {
              get: (_t, prop) => {
                if (prop === 'then') return (resolve) => resolve({ data: [], error: null, count: 0 });
                if (prop === 'execute') return () => Promise.resolve({ data: [], error: null, count: 0 });
                return (..._a) => chain;
              },
            }
          );
          return chain;
        },
      }
    );

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
      signUp: () => Promise.reject(new Error('Supabase not configured')),
      signOut: () => Promise.resolve(),
      resetPasswordForEmail: () => Promise.reject(new Error('Supabase not configured')),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      setSession: () => Promise.resolve(),
    },
    from: () => chainable(),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
    storage: {
      from: () => ({
        upload: () => Promise.reject(new Error('Supabase not configured')),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
};

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createMockClient();

export const isSupabaseConfigured = isConfigured;

export default supabase;
