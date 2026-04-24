import { createTheme, alpha } from '@mui/material/styles';

const sharedTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
  h1: { fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.02em' },
  h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.01em' },
  h3: { fontWeight: 700, fontSize: '1.5rem' },
  h4: { fontWeight: 600, fontSize: '1.25rem' },
  h5: { fontWeight: 600, fontSize: '1.1rem' },
  h6: { fontWeight: 600, fontSize: '1rem' },
  subtitle1: { fontWeight: 500, fontSize: '0.95rem' },
  subtitle2: { fontWeight: 500, fontSize: '0.85rem', letterSpacing: '0.02em' },
  body1: { fontSize: '0.95rem', lineHeight: 1.7 },
  body2: { fontSize: '0.875rem', lineHeight: 1.6 },
  button: { fontWeight: 600, letterSpacing: '0.02em', textTransform: 'none' },
};

const sharedShape = {
  borderRadius: 12,
};

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          primary: { main: '#6C63FF', light: '#8B85FF', dark: '#4F46E5', contrastText: '#fff' },
          secondary: { main: '#F472B6', light: '#F9A8D4', dark: '#DB2777' },
          background: {
            default: '#0B0F1A',
            paper: '#111827',
            elevated: '#1A2035',
          },
          surface: {
            main: '#1A2035',
            light: '#1F2A40',
            dark: '#0D1321',
          },
          divider: alpha('#6C63FF', 0.12),
          text: {
            primary: '#F1F5F9',
            secondary: '#94A3B8',
            disabled: '#475569',
          },
          success: { main: '#34D399', dark: '#059669' },
          warning: { main: '#FBBF24', dark: '#D97706' },
          error: { main: '#F87171', dark: '#DC2626' },
          info: { main: '#38BDF8', dark: '#0284C7' },
          action: {
            hover: alpha('#6C63FF', 0.08),
            selected: alpha('#6C63FF', 0.16),
            focus: alpha('#6C63FF', 0.12),
          },
        }
      : {
          primary: { main: '#4F46E5', light: '#6C63FF', dark: '#3730A3', contrastText: '#fff' },
          secondary: { main: '#DB2777', light: '#F472B6', dark: '#9D174D' },
          background: {
            default: '#F8FAFC',
            paper: '#FFFFFF',
            elevated: '#F1F5F9',
          },
          surface: {
            main: '#F1F5F9',
            light: '#F8FAFC',
            dark: '#E2E8F0',
          },
          divider: alpha('#4F46E5', 0.1),
          text: {
            primary: '#0F172A',
            secondary: '#475569',
            disabled: '#94A3B8',
          },
          success: { main: '#059669', light: '#34D399' },
          warning: { main: '#D97706', light: '#FBBF24' },
          error: { main: '#DC2626', light: '#F87171' },
          info: { main: '#0284C7', light: '#38BDF8' },
          action: {
            hover: alpha('#4F46E5', 0.04),
            selected: alpha('#4F46E5', 0.08),
            focus: alpha('#4F46E5', 0.06),
          },
        }),
  },
  typography: sharedTypography,
  shape: sharedShape,
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${theme.palette.background.default};
        }
        ::-webkit-scrollbar-thumb {
          background: ${alpha(theme.palette.primary.main, 0.3)};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${alpha(theme.palette.primary.main, 0.5)};
        }
        
        body {
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: ${alpha(theme.palette.primary.main, 0.3)} ${theme.palette.background.default};
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.875rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        }),
        contained: ({ theme }) => ({
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.palette.mode === 'dark'
              ? `0 8px 32px ${alpha('#000', 0.4)}`
              : `0 8px 32px ${alpha('#000', 0.08)}`,
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          ...(theme.palette.mode === 'dark' && {
            backgroundColor: theme.palette.background.paper,
          }),
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              },
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundImage: 'none',
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backdropFilter: 'blur(20px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 20,
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.16),
            },
          },
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 48,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          borderRadius: 8,
          fontSize: '0.8rem',
          backgroundColor: theme.palette.mode === 'dark' ? '#1F2A40' : '#1E293B',
          color: '#F1F5F9',
          padding: '6px 12px',
        }),
      },
    },
  },
});

export const createAppTheme = (mode) => createTheme(getDesignTokens(mode));
