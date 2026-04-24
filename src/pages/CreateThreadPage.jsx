import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, Button, Grid,
  Chip, Autocomplete, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import useForumStore from '../store/forumStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const CreateThreadPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createThread, categories } = useForumStore();
  const { userRoles } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState([]);
  const [clubId, setClubId] = useState(searchParams.get('club') || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setLoading(true);
    const result = await createThread({
      title, content, category, tags,
      club_id: clubId || undefined,
      is_organization_wide: !clubId,
    });
    if (result.success) {
      toast.success('Thread created!');
      navigate(`/forum/${result.data.id}`);
    } else {
      toast.error(result.error || 'Failed to create thread');
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/forum')}>Back</Button>
        <Typography variant="h5" fontWeight={800}>Create New Thread</Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, maxWidth: 800 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Thread Title" value={title}
                onChange={(e) => setTitle(e.target.value)} required
                placeholder="What would you like to discuss?" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Club (optional)</InputLabel>
                <Select value={clubId} label="Club (optional)" onChange={(e) => setClubId(e.target.value)}>
                  <MenuItem value="">Organization-wide</MenuItem>
                  {userRoles.filter(r => r.clubs).map((role) => (
                    <MenuItem key={role.club_id} value={role.club_id}>
                      {role.clubs?.name || role.club_id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete multiple freeSolo value={tags}
                onChange={(_, v) => setTags(v)}
                options={['discussion', 'help', 'event', 'project', 'idea', 'feedback']}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} size="small" {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => <TextField {...params} label="Tags" placeholder="Add tags..." />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Content" multiline rows={10} value={content}
                onChange={(e) => setContent(e.target.value)} required
                placeholder="Write your discussion content here. You can use line breaks for formatting." />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/forum')}>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<Send />} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Thread'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateThreadPage;
