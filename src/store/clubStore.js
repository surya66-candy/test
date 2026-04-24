import { create } from 'zustand';
import { clubsApi } from '../services/api';

const useClubStore = create((set, get) => ({
  clubs: [],
  currentClub: null,
  clubHistory: [],
  loading: false,
  error: null,

  fetchClubs: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await clubsApi.list(params);
      set({ clubs: data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
    }
  },

  fetchClub: async (clubId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await clubsApi.get(clubId);
      set({ currentClub: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
    }
  },

  fetchClubBySlug: async (slug) => {
    set({ loading: true, error: null });
    try {
      const { data } = await clubsApi.getBySlug(slug);
      set({ currentClub: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
    }
  },

  createClub: async (clubData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await clubsApi.create(clubData);
      set((state) => ({ clubs: [...state.clubs, data], loading: false }));
      return { success: true, data };
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  updateClub: async (clubId, clubData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await clubsApi.update(clubId, clubData);
      set((state) => ({
        clubs: state.clubs.map((c) => (c.id === clubId ? data : c)),
        currentClub: state.currentClub?.id === clubId ? data : state.currentClub,
        loading: false,
      }));
      return { success: true, data };
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  deleteClub: async (clubId) => {
    set({ loading: true, error: null });
    try {
      await clubsApi.delete(clubId);
      set((state) => ({
        clubs: state.clubs.filter((c) => c.id !== clubId),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
      return { success: false };
    }
  },

  // Club History
  fetchClubHistory: async (clubId) => {
    try {
      const { data } = await clubsApi.getHistory(clubId);
      set({ clubHistory: data });
    } catch (error) {
      console.error('Error fetching club history:', error);
    }
  },

  addHistoryEntry: async (clubId, entry) => {
    try {
      const { data } = await clubsApi.addHistory(clubId, entry);
      set((state) => ({ clubHistory: [...state.clubHistory, data] }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  updateHistoryEntry: async (clubId, historyId, entry) => {
    try {
      const { data } = await clubsApi.updateHistory(clubId, historyId, entry);
      set((state) => ({
        clubHistory: state.clubHistory.map((h) => (h.id === historyId ? data : h)),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  deleteHistoryEntry: async (clubId, historyId) => {
    try {
      await clubsApi.deleteHistory(clubId, historyId);
      set((state) => ({
        clubHistory: state.clubHistory.filter((h) => h.id !== historyId),
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  setCurrentClub: (club) => set({ currentClub: club }),
  clearError: () => set({ error: null }),
}));

export default useClubStore;
