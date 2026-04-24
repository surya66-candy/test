import { create } from 'zustand';
import { membersApi } from '../services/api';

const useMemberStore = create((set) => ({
  members: [],
  currentMember: null,
  loading: false,
  error: null,
  searchQuery: '',
  statusFilter: 'all',

  fetchMembers: async (clubId, params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await membersApi.list(clubId, params);
      set({ members: data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
    }
  },

  addMember: async (clubId, memberData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await membersApi.add(clubId, memberData);
      set((state) => ({ members: [...state.members, data], loading: false }));
      return { success: true, data };
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  updateMember: async (memberId, memberData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await membersApi.update(memberId, memberData);
      set((state) => ({
        members: state.members.map((m) => (m.id === memberId ? data : m)),
        loading: false,
      }));
      return { success: true, data };
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  removeMember: async (memberId) => {
    set({ loading: true, error: null });
    try {
      await membersApi.remove(memberId);
      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
      return { success: false };
    }
  },

  exportMembers: async (clubId) => {
    try {
      const response = await membersApi.export(clubId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `members_${clubId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setCurrentMember: (member) => set({ currentMember: member }),
  clearError: () => set({ error: null }),

  // Computed: filtered members
  getFilteredMembers: () => {
    const { members, searchQuery, statusFilter } = useMemberStore.getState();
    return members.filter((m) => {
      const matchesSearch =
        !searchQuery ||
        m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  },
}));

export default useMemberStore;
