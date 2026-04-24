import { create } from 'zustand';

const useThemeStore = create((set) => ({
  mode: localStorage.getItem('theme-mode') || 'dark',
  toggleMode: () =>
    set((state) => {
      const newMode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme-mode', newMode);
      return { mode: newMode };
    }),
  setMode: (mode) => {
    localStorage.setItem('theme-mode', mode);
    set({ mode });
  },
}));

export default useThemeStore;
