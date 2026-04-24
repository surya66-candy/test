import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, TextField, InputAdornment,
  Chip, Tabs, Tab, Grid, Avatar, Divider, Select, MenuItem,
  FormControl, InputLabel, alpha,
} from '@mui/material';
import {
  Add, Search, Forum, TrendingUp, PushPin,
  Lock, Visibility, ChatBubbleOutlined,
} from '@mui/icons-material';
import useForumStore from '../store/forumStore';
import useAuthStore from '../store/authStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const ForumHomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { threads, fetchThreads, categories, filters, setFilters, loading } = useForumStore();
  const { userRoles } = useAuthStore();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const clubId = searchParams.get('club');
    if (clubId) setFilters({ clubId });
    fetchThreads();
  }, []);

  const handleTabChange = (_, v) => {
    setTab(v);
    if (v === 0) setFilters({ category: null });
    else setFilters({ category: categories[v - 1] });
    fetchThreads();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Forum
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Discuss, share ideas, and collaborate across clubs
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/forum/new')}
          sx={{ borderRadius: 2 }}>
          New Thread
        </Button>
      </Box>

      {/* Search + Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}`,
        display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField size="small" placeholder="Search threads..." value={filters.search}
          onChange={(e) => { setFilters({ search: e.target.value }); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20 }} /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Sort</InputLabel>
          <Select value={filters.sortBy} label="Sort" onChange={(e) => { setFilters({ sortBy: e.target.value }); fetchThreads(); }}>
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="most_viewed">Most Viewed</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Category Tabs */}
      <Paper sx={{ borderRadius: 2, mb: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="All" />
          {categories.map((c) => <Tab key={c} label={c} />)}
        </Tabs>
      </Paper>

      {/* Thread List */}
      {threads && threads.length > 0 ? (
        threads.map((thread) => (
          <Paper key={thread.id}
            onClick={() => navigate(`/forum/${thread.id}`)}
            sx={{
              p: 2.5, mb: 1.5, borderRadius: 2, cursor: 'pointer',
              border: (t) => `1px solid ${t.palette.divider}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                transform: 'translateX(4px)',
                boxShadow: (t) => `0 4px 20px ${alpha(t.palette.primary.main, 0.08)}`,
              },
              ...(thread.is_pinned && {
                borderLeft: (t) => `3px solid ${t.palette.primary.main}`,
                backgroundColor: (t) => alpha(t.palette.primary.main, 0.03),
              }),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar sx={{
                width: 44, height: 44,
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                fontSize: '0.95rem',
              }}>
                {thread.author_name?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {thread.is_pinned && <PushPin sx={{ fontSize: 16, color: 'primary.main' }} />}
                  {thread.is_locked && <Lock sx={{ fontSize: 16, color: 'warning.main' }} />}
                  <Typography variant="subtitle1" fontWeight={700}>{thread.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{
                  mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {thread.content?.replace(/<[^>]*>/g, '').substring(0, 200)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
                  {thread.category && (
                    <Chip label={thread.category} size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                  )}
                  {thread.tags?.slice(0, 3).map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                  ))}
                  <Typography variant="caption" color="text.secondary">
                    {thread.author_name || 'Unknown'} · {dayjs(thread.created_at).fromNow()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">{thread.views_count || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ChatBubbleOutline sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">{thread.reply_count || 0}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        ))
      ) : (
        <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center', border: (t) => `1px solid ${t.palette.divider}` }}>
          <Forum sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">No threads yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start the conversation by creating the first thread
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/forum/new')}>
            Create Thread
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default ForumHomePage;
