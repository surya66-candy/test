import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Avatar,
  Button, Divider, Chip, alpha, List, ListItemButton,
  ListItemAvatar, ListItemText,
} from '@mui/material';
import {
  Groups, Forum, Person, AdminPanelSettings, Add,
  TrendingUp, Shield, Delete,
} from '@mui/icons-material';
import useAuthStore from '../store/authStore';
import useClubStore from '../store/clubStore';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { isOrgAdmin, userRoles } = useAuthStore();
  const { clubs, fetchClubs, deleteClub } = useClubStore();

  useEffect(() => { fetchClubs(); }, []);

  if (!isOrgAdmin()) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Shield sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" fontWeight={700}>Access Denied</Typography>
        <Typography color="text.secondary">You need Organization Admin privileges to access this page.</Typography>
        <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>Go to Dashboard</Button>
      </Box>
    );
  }

  const stats = [
    { label: 'Total Clubs', value: clubs?.length || 0, icon: <Groups />, color: '#6C63FF' },
    { label: 'Total Roles', value: userRoles.length, icon: <Person />, color: '#F472B6' },
    { label: 'Admins', value: userRoles.filter(r => r.role.includes('admin')).length, icon: <AdminPanelSettings />, color: '#34D399' },
    { label: 'Active', value: clubs?.length || 0, icon: <TrendingUp />, color: '#FBBF24' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Admin Panel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your organization&apos;s clubs and members
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/clubs/new')}>
          Create Club
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <Card sx={{
              background: (t) => t.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(s.color, 0.15)}, ${alpha(s.color, 0.05)})`
                : `linear-gradient(135deg, ${alpha(s.color, 0.08)}, ${alpha(s.color, 0.02)})`,
              border: `1px solid ${alpha(s.color, 0.2)}`,
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">{s.label}</Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                </Box>
                <Avatar sx={{ background: `linear-gradient(135deg, ${s.color}, ${alpha(s.color, 0.6)})`, width: 48, height: 48 }}>
                  {s.icon}
                </Avatar>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Club Management */}
      <Paper sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>All Clubs</Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {clubs && clubs.map((club) => (
            <ListItemButton key={club.id} onClick={() => navigate(`/clubs/${club.slug}`)}
              sx={{ borderRadius: 2, mb: 1 }}>
              <ListItemAvatar>
                <Avatar src={club.logo_url} sx={{
                  background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                }}>
                  {club.name?.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={club.name}
                secondary={club.description?.substring(0, 80) || 'No description'}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
              <Chip label={club.slug} size="small" variant="outlined" sx={{ mr: 1 }} />
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); navigate(`/clubs/${club.slug}/edit`); }}>
                Edit
              </Button>
            </ListItemButton>
          ))}
        </List>
        {(!clubs || clubs.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Groups sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No clubs created yet</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminDashboardPage;
