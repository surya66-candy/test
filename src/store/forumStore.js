import { create } from 'zustand';
import { forumApi } from '../services/api';

const useForumStore = create((set, get) => ({
  threads: [],
  currentThread: null,
  replies: [],
  categories: ['General', 'Announcements', 'Events', 'Projects', 'Help & Support', 'Off-Topic'],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  filters: {
    clubId: null,
    category: null,
    search: '',
    sortBy: 'newest',
  },

  fetchThreads: async (params = {}, append = false) => {
    set({ loading: true, error: null });
    try {
      const { filters, page } = get();
      const queryParams = {
        ...filters,
        ...params,
        page: append ? page : 1,
        limit: 20,
      };
      const { data } = await forumApi.listThreads(queryParams);
      set((state) => ({
        threads: append ? [...state.threads, ...data.threads] : data.threads || data,
        hasMore: data.has_more ?? (data.threads || data).length === 20,
        page: append ? state.page + 1 : 2,
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
    }
  },

  fetchThread: async (threadId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await forumApi.getThread(threadId);
      set({ currentThread: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
    }
  },

  createThread: async (threadData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await forumApi.createThread(threadData);
      set((state) => ({ threads: [data, ...state.threads], loading: false }));
      return { success: true, data };
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  updateThread: async (threadId, threadData) => {
    try {
      const { data } = await forumApi.updateThread(threadId, threadData);
      set((state) => ({
        threads: state.threads.map((t) => (t.id === threadId ? data : t)),
        currentThread: state.currentThread?.id === threadId ? data : state.currentThread,
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  deleteThread: async (threadId) => {
    try {
      await forumApi.deleteThread(threadId);
      set((state) => ({
        threads: state.threads.filter((t) => t.id !== threadId),
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  pinThread: async (threadId) => {
    try {
      const { data } = await forumApi.pinThread(threadId);
      set((state) => ({
        threads: state.threads.map((t) => (t.id === threadId ? { ...t, is_pinned: !t.is_pinned } : t)),
        currentThread: state.currentThread?.id === threadId
          ? { ...state.currentThread, is_pinned: !state.currentThread.is_pinned }
          : state.currentThread,
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  lockThread: async (threadId) => {
    try {
      const { data } = await forumApi.lockThread(threadId);
      set((state) => ({
        threads: state.threads.map((t) => (t.id === threadId ? { ...t, is_locked: !t.is_locked } : t)),
        currentThread: state.currentThread?.id === threadId
          ? { ...state.currentThread, is_locked: !state.currentThread.is_locked }
          : state.currentThread,
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  // Replies
  fetchReplies: async (threadId) => {
    try {
      const { data } = await forumApi.getReplies(threadId);
      set({ replies: data });
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  },

  addReply: async (threadId, content, parentReplyId = null) => {
    try {
      const { data } = await forumApi.addReply(threadId, { content, parent_reply_id: parentReplyId });
      set((state) => ({ replies: [...state.replies, data] }));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  },

  deleteReply: async (replyId) => {
    try {
      await forumApi.deleteReply(replyId);
      set((state) => ({ replies: state.replies.filter((r) => r.id !== replyId) }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  voteReply: async (replyId, voteType) => {
    try {
      await forumApi.vote(replyId, voteType);
      set((state) => ({
        replies: state.replies.map((r) => {
          if (r.id === replyId) {
            return {
              ...r,
              upvotes: voteType === 'up' ? r.upvotes + 1 : r.upvotes,
              downvotes: voteType === 'down' ? r.downvotes + 1 : r.downvotes,
            };
          }
          return r;
        }),
      }));
    } catch (error) {
      console.error('Vote failed:', error);
    }
  },

  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  setCurrentThread: (thread) => set({ currentThread: thread }),
  clearError: () => set({ error: null }),
}));

export default useForumStore;
