import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Avatar, alpha, Chip,
} from '@mui/material';
import {
  Dashboard, Groups, Forum, AdminPanelSettings,
  History, Add, Settings, GroupWork,
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import useClubStore from '../../store/clubStore';

const Sidebar = ({ drawerWidth, mobileOpen, onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRoles, isOrgAdmin } = useAuthStore();
  const { clubs } = useClubStore();

  const mainNavItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { label: 'Forum', icon: <Forum />, path: '/forum' },
  ];

  if (isOrgAdmin()) {
    mainNavItems.push({ label: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' });
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Box sx={{
        p: 3, display: 'flex', alignItems: 'center', gap: 1.5,
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2,
          background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: (t) => `0 4px 16px ${alpha(t.palette.primary.main, 0.3)}`,
        }}>
          <Forum sx={{ fontSize: 22, color: '#fff' }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, fontSize: '1.05rem' }}>
            ClubConnect
          </Typography>
          <Typography variant="caption" color="text.secondary">Forum Platform</Typography>
        </Box>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ px: 1, py: 2, flex: 1, overflowY: 'auto' }}>
        <Typography variant="overline" sx={{ px: 2, color: 'text.secondary', fontWeight: 700, letterSpacing: 1.5 }}>
          Navigation
        </Typography>
        <List sx={{ py: 0.5 }}>
          {mainNavItems.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => { navigate(item.path); if (isMobile) onClose(); }}
              selected={isActive(item.path)}
              sx={{
                '&.Mui-selected': {
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                  '& .MuiListItemText-primary': { fontWeight: 700, color: 'primary.main' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 1.5, mx: 2 }} />

        {/* Clubs */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 0.5 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.5 }}>
            Clubs
          </Typography>
          {isOrgAdmin() && (
            <Chip
              icon={<Add sx={{ fontSize: 16 }} />}
              label="New"
              size="small"
              onClick={() => { navigate('/clubs/new'); if (isMobile) onClose(); }}
              sx={{ height: 24, fontSize: '0.7rem', cursor: 'pointer' }}
            />
          )}
        </Box>
        <List sx={{ py: 0.5 }}>
          {userRoles.filter(r => r.clubs).map((role) => (
            <ListItemButton
              key={role.club_id}
              onClick={() => { navigate(`/clubs/${role.clubs?.slug || role.club_id}`); if (isMobile) onClose(); }}
              selected={isActive(`/clubs/${role.clubs?.slug || role.club_id}`)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Avatar
                  sx={{
                    width: 28, height: 28, fontSize: '0.75rem',
                    background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                  }}
                >
                  {role.clubs?.name?.charAt(0) || 'C'}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={role.clubs?.name || 'Club'}
                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500, noWrap: true }}
              />
              <Chip
                label={role.role === 'club_admin' ? 'Admin' : role.role === 'org_admin' ? 'Org' : 'Member'}
                size="small"
                color={role.role.includes('admin') ? 'primary' : 'default'}
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            </ListItemButton>
          ))}
          {userRoles.length === 0 && (
            <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
              <GroupWork sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No clubs yet
              </Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* User section */}
      <Box sx={{
        p: 2, borderTop: (t) => `1px solid ${t.palette.divider}`,
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <Avatar
          sx={{
            width: 36, height: 36,
            background: (t) => `linear-gradient(135deg, ${t.palette.secondary.main}, ${t.palette.secondary.dark})`,
          }}
        >
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email || ''}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
