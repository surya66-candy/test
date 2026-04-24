import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Typography, Badge, Box,
  Menu, MenuItem, ListItemIcon, Divider, Tooltip, InputBase, alpha,
} from '@mui/material';
import {
  Menu as MenuIcon, Notifications, Search,
  DarkMode, LightMode, Logout, Person, Settings,
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import useNotificationStore from '../../store/notificationStore';

const TopBar = ({ onMenuClick, isMobile }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const { unreadCount } = useNotificationStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{
      ml: isMobile ? 0 : '280px',
      width: isMobile ? '100%' : 'calc(100% - 280px)',
      transition: 'all 0.3s ease',
    }}>
      <Toolbar sx={{ gap: 1 }}>
        {isMobile && (
          <IconButton edge="start" onClick={onMenuClick} sx={{ color: 'text.primary' }}>
            <MenuIcon />
          </IconButton>
        )}

        {/* Search Bar */}
        <Box sx={{
          display: 'flex', alignItems: 'center', borderRadius: 2, px: 2, py: 0.5,
          backgroundColor: (t) => alpha(t.palette.mode === 'dark' ? '#fff' : '#000', 0.05),
          border: (t) => `1px solid ${searchFocused ? t.palette.primary.main : 'transparent'}`,
          transition: 'all 0.2s ease',
          flex: 1, maxWidth: 480,
          boxShadow: searchFocused ? (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.1)}` : 'none',
        }}>
          <Search sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Search clubs, threads, members..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            sx={{ flex: 1, fontSize: '0.875rem' }}
          />
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Theme toggle */}
        <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
          <IconButton onClick={toggleMode} sx={{
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
            transition: 'all 0.2s ease',
          }}>
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            onClick={() => navigate('/notifications')}
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User menu */}
        <Tooltip title="Account">
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              ml: 0.5, p: 0.5,
              border: (t) => `2px solid ${alpha(t.palette.primary.main, 0.2)}`,
              borderRadius: 2,
              '&:hover': { border: (t) => `2px solid ${t.palette.primary.main}` },
            }}
          >
            <Box sx={{
              width: 32, height: 32, borderRadius: 1.5, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              color: '#fff', fontSize: '0.85rem', fontWeight: 700,
            }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Box>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1, minWidth: 200, borderRadius: 2,
              border: (t) => `1px solid ${t.palette.divider}`,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {user?.user_metadata?.full_name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); }}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); }}>
            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><Logout fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
