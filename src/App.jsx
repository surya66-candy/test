import { useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { createAppTheme } from './theme/theme';
import useThemeStore from './store/themeStore';
import router from './router';

function App() {
  const { mode } = useThemeStore();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: mode === 'dark' ? '#1F2A40' : '#fff',
            color: mode === 'dark' ? '#F1F5F9' : '#0F172A',
            borderRadius: '12px',
            border: mode === 'dark' ? '1px solid rgba(108, 99, 255, 0.2)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;
