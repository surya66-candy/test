import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Tabs, Tab, Avatar, Button, Chip,
  Grid, Card, CardContent, Skeleton, alpha, Divider, Link,
} from '@mui/material';
import {
  Edit, People, History, Forum, CalendarToday, Email, Phone, Language,
} from '@mui/icons-material';
import useClubStore from '../store/clubStore';
import useAuthStore from '../store/authStore';
import useMemberStore from '../store/memberStore';
import dayjs from 'dayjs';

const ClubProfilePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentClub, fetchClubBySlug, clubHistory, fetchClubHistory, loading } = useClubStore();
  const { isClubAdmin } = useAuthStore();
  const { members, fetchMembers } = useMemberStore();
  const [tab, setTab] = useState(0);

  useEffect(() => { fetchClubBySlug(slug); }, [slug]);
  useEffect(() => {
    if (currentClub?.id) { fetchClubHistory(currentClub.id); fetchMembers(currentClub.id); }
  }, [currentClub?.id]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: 2, mb: 2 }} />
      </Box>
    );
  }

  if (!currentClub) {
    return <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5" color="text.secondary">Club not found</Typography></Box>;
  }

  const canEdit = isClubAdmin(currentClub.id);

  return (
    <Box>
      {/* Banner */}
      <Paper sx={{
        position: 'relative', height: 280, borderRadius: 3, overflow: 'hidden', mb: 3,
        background: currentClub.banner_url ? `url(${currentClub.banner_url}) center/cover`
          : (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.secondary.dark})`,
      }}>
        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', p: 3,
          display: 'flex', alignItems: 'flex-end', gap: 2,
        }}>
          <Avatar src={currentClub.logo_url} sx={{
            width: 90, height: 90, borderRadius: 3, border: '4px solid rgba(255,255,255,0.2)',
            background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
            fontSize: '2rem', fontWeight: 800,
          }}>
            {currentClub.name?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>{currentClub.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              {currentClub.establishment_date && (
                <Chip icon={<CalendarToday sx={{ fontSize: 14 }} />}
                  label={`Est. ${dayjs(currentClub.establishment_date).format('YYYY')}`}
                  size="small" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} variant="outlined" />
              )}
              <Chip label={`${members?.length || 0} Members`} size="small"
                sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} variant="outlined" />
            </Box>
          </Box>
          {canEdit && (
            <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/clubs/${slug}/edit`)}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>Edit</Button>
          )}
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, mb: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="About" />
          <Tab label="History" icon={<History sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label={`Members (${members?.length || 0})`} icon={<People sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="Forum" icon={<Forum sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* About */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>About</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {currentClub.description || 'No description provided.'}
              </Typography>
              {currentClub.mission_statement && (
                <Box sx={{ mt: 3, p: 2, borderRadius: 2, borderLeft: (t) => `4px solid ${t.palette.primary.main}`,
                  backgroundColor: (t) => alpha(t.palette.primary.main, 0.05) }}>
                  <Typography variant="subtitle2" fontWeight={700} color="primary" gutterBottom>Mission</Typography>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    &ldquo;{currentClub.mission_statement}&rdquo;
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Contact</Typography>
              {currentClub.contact_email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2">{currentClub.contact_email}</Typography>
                </Box>
              )}
              {currentClub.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2">{currentClub.phone}</Typography>
                </Box>
              )}
              {currentClub.social_links && Object.entries(currentClub.social_links).map(([p, url]) => (
                <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Language sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Link href={url} target="_blank" variant="body2" sx={{ textTransform: 'capitalize' }}>{p}</Link>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* History */}
      {tab === 1 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Club History</Typography>
          {clubHistory && clubHistory.length > 0 ? (
            <Box sx={{ position: 'relative', pl: 4 }}>
              <Box sx={{ position: 'absolute', left: 12, top: 0, bottom: 0, width: 2,
                background: (t) => `linear-gradient(to bottom, ${t.palette.primary.main}, ${alpha(t.palette.primary.main, 0.1)})` }} />
              {clubHistory.sort((a, b) => new Date(b.event_date) - new Date(a.event_date)).map((e) => (
                <Box key={e.id} sx={{ position: 'relative', mb: 3 }}>
                  <Box sx={{ position: 'absolute', left: -28, top: 4, width: 16, height: 16, borderRadius: '50%',
                    border: (t) => `3px solid ${t.palette.primary.main}`, backgroundColor: (t) => t.palette.background.paper, zIndex: 1 }} />
                  <Card sx={{ ml: 1 }}>
                    <CardContent>
                      <Chip label={e.event_type || 'milestone'} size="small" color="primary" sx={{ mb: 1, height: 22, fontSize: '0.7rem' }} />
                      <Typography variant="subtitle1" fontWeight={700}>{e.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{e.description}</Typography>
                      {e.event_date && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {dayjs(e.event_date).format('MMM D, YYYY')}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <History sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography color="text.secondary">No history entries yet</Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Members */}
      {tab === 2 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>Members</Typography>
            <Button size="small" onClick={() => navigate(`/clubs/${slug}/members`)}>Manage Members</Button>
          </Box>
          <Grid container spacing={2}>
            {members && members.length > 0 ? members.slice(0, 8).map((m) => (
              <Grid item xs={12} sm={6} md={3} key={m.id}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar src={m.photo_url} sx={{ width: 64, height: 64, mx: 'auto', mb: 1,
                    background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})` }}>
                    {m.full_name?.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={700}>{m.full_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{m.position || m.role || 'Member'}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label={m.status} size="small" sx={{ height: 20, fontSize: '0.65rem', textTransform: 'capitalize' }}
                      color={m.status === 'active' ? 'success' : 'default'} />
                  </Box>
                </Card>
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <People sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography color="text.secondary">No members yet</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* Forum */}
      {tab === 3 && (
        <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', border: (t) => `1px solid ${t.palette.divider}` }}>
          <Forum sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">Visit the Forum page to see club discussions</Typography>
          <Button onClick={() => navigate('/forum')} sx={{ mt: 1 }}>Go to Forum</Button>
        </Paper>
      )}
    </Box>
  );
};

export default ClubProfilePage;
