import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  userRoles: [],
  loading: true,
  error: null,

  // Initialize auth state from Supabase session
  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {
        set({ session, user: session.user, loading: false });
        await get().fetchUserRoles(session.user.id);
      } else {
        set({ loading: false });
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          set({ session, user: session.user });
          await get().fetchUserRoles(session.user.id);
        } else {
          set({ session: null, user: null, userRoles: [] });
        }
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch user roles from database
  fetchUserRoles: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*, clubs(name, slug)')
        .eq('user_id', userId);

      if (error) throw error;
      set({ userRoles: data || [] });
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  },

  // Login with email/password
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ user: data.user, session: data.session, loading: false });
      await get().fetchUserRoles(data.user.id);
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Sign up
  signup: async (email, password, metadata = {}) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw error;
      set({ loading: false });
      return { success: true, user: data.user };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, userRoles: [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Helper: check if user is org admin
  isOrgAdmin: () => {
    return get().userRoles.some((r) => r.role === 'org_admin');
  },

  // Helper: check if user is club admin for a specific club
  isClubAdmin: (clubId) => {
    return get().userRoles.some(
      (r) => (r.role === 'club_admin' && r.club_id === clubId) || r.role === 'org_admin'
    );
  },

  // Helper: check if user is member of a club
  isClubMember: (clubId) => {
    return get().userRoles.some((r) => r.club_id === clubId);
  },

  // Helper: get role for a specific club
  getClubRole: (clubId) => {
    if (get().isOrgAdmin()) return 'org_admin';
    const role = get().userRoles.find((r) => r.club_id === clubId);
    return role?.role || null;
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
