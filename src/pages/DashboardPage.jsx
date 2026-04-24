import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Card, CardContent, CardActionArea,
  Avatar, Chip, Skeleton, alpha, Button, Paper, Divider,
} from '@mui/material';
import {
  Groups, Forum, TrendingUp, Add, ArrowForward,
  EmojiEvents, CalendarToday,
} from '@mui/icons-material';
import useAuthStore from '../store/authStore';
import useClubStore from '../store/clubStore';
import useForumStore from '../store/forumStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const StatCard = ({ icon, label, value, color, gradient }) => (
  <Card sx={{
    background: (t) => t.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha(color, 0.15)}, ${alpha(color, 0.05)})`
      : `linear-gradient(135deg, ${alpha(color, 0.08)}, ${alpha(color, 0.02)})`,
    border: (t) => `1px solid ${alpha(color, 0.2)}`,
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ color, lineHeight: 1.2 }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{
          width: 56, height: 56,
          background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.6)})`,
          boxShadow: `0 4px 20px ${alpha(color, 0.3)}`,
        }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, userRoles, isOrgAdmin } = useAuthStore();
  const { clubs, fetchClubs, loading: clubsLoading } = useClubStore();
  const { threads, fetchThreads, loading: threadsLoading } = useForumStore();

  useEffect(() => {
    fetchClubs();
    fetchThreads({ limit: 5, sortBy: 'newest' });
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{
          background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {greeting()}, {user?.user_metadata?.full_name || 'there'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Here&apos;s what&apos;s happening across your clubs today.
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<Groups />} label="My Clubs" value={userRoles.length} color="#6C63FF" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<Forum />} label="Active Threads" value={threads?.length || 0} color="#F472B6" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<TrendingUp />} label="Total Clubs" value={clubs?.length || 0} color="#34D399" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<EmojiEvents />} label="My Roles" value={userRoles.filter(r => r.role.includes('admin')).length} color="#FBBF24" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Clubs Section */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Your Clubs</Typography>
              {isOrgAdmin() && (
                <Button size="small" startIcon={<Add />} onClick={() => navigate('/clubs/new')}>
                  Create Club
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            {clubsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 1.5, borderRadius: 2 }} />
              ))
            ) : clubs && clubs.length > 0 ? (
              clubs.slice(0, 5).map((club) => (
                <Card key={club.id} sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
                  <CardActionArea onClick={() => navigate(`/clubs/${club.slug}`)} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={club.logo_url}
                        sx={{
                          width: 48, height: 48, borderRadius: 2,
                          background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                          fontSize: '1.2rem', fontWeight: 700,
                        }}
                      >
                        {club.name?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>{club.name}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {club.description || 'No description'}
                        </Typography>
                      </Box>
                      <ArrowForward sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </Box>
                  </CardActionArea>
                </Card>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Groups sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No clubs available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Threads */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Recent Discussions</Typography>
              <Button size="small" onClick={() => navigate('/forum')} endIcon={<ArrowForward />}>
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {threadsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={60} sx={{ mb: 1.5, borderRadius: 2 }} />
              ))
            ) : threads && threads.length > 0 ? (
              threads.slice(0, 5).map((thread) => (
                <Box
                  key={thread.id}
                  onClick={() => navigate(`/forum/${thread.id}`)}
                  sx={{
                    p: 2, mb: 1, borderRadius: 2, cursor: 'pointer',
                    border: (t) => `1px solid ${t.palette.divider}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: (t) => t.palette.action.hover,
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} noWrap>{thread.title}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {thread.category && (
                      <Chip label={thread.category} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(thread.created_at).fromNow()}
                    </Typography>
                    {thread.is_pinned && (
                      <Chip label="Pinned" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                    )}
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Forum sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No discussions yet</Typography>
                <Button size="small" onClick={() => navigate('/forum/new')} startIcon={<Add />} sx={{ mt: 1 }}>
                  Start a Discussion
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
