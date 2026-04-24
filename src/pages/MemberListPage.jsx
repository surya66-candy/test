import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, TextField, InputAdornment,
  Avatar, Chip, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, FormControl, InputLabel,
  IconButton, Tooltip, Divider, alpha,
} from '@mui/material';
import {
  Add, Search, Edit, Delete, FileDownload, ArrowBack,
  Person, Email, Phone, FilterList,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import useClubStore from '../store/clubStore';
import useMemberStore from '../store/memberStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const MemberListPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentClub, fetchClubBySlug } = useClubStore();
  const { members, fetchMembers, addMember, updateMember, removeMember, exportMembers,
    searchQuery, setSearchQuery, statusFilter, setStatusFilter } = useMemberStore();
  const { isClubAdmin } = useAuthStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchClubBySlug(slug); }, [slug]);
  useEffect(() => { if (currentClub?.id) fetchMembers(currentClub.id); }, [currentClub?.id]);

  const canEdit = currentClub && isClubAdmin(currentClub.id);

  const filtered = members?.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || m.full_name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  }) || [];

  const openDialog = (member = null) => {
    setEditMember(member);
    if (member) reset(member);
    else reset({ full_name: '', email: '', phone: '', role: '', position: '', biography: '', status: 'active' });
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    let result;
    if (editMember) {
      result = await updateMember(editMember.id, data);
    } else {
      result = await addMember(currentClub.id, data);
    }
    if (result.success) {
      toast.success(editMember ? 'Member updated!' : 'Member added!');
      setDialogOpen(false);
    } else {
      toast.error(result.error || 'Failed');
    }
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('Remove this member?')) {
      const result = await removeMember(memberId);
      if (result.success) toast.success('Member removed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/clubs/${slug}`)}>Back</Button>
        <Typography variant="h5" fontWeight={800} sx={{ flex: 1 }}>
          Members — {currentClub?.name || ''}
        </Typography>
        {canEdit && (
          <>
            <Button variant="outlined" startIcon={<FileDownload />}
              onClick={() => currentClub && exportMembers(currentClub.id)}>Export</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}>Add Member</Button>
          </>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}`,
        display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField size="small" placeholder="Search members..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20 }} /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="alumni">Alumni</MenuItem>
          </Select>
        </FormControl>
        <Chip label={`${filtered.length} members`} color="primary" variant="outlined" />
      </Paper>

      {/* Members Grid */}
      <Grid container spacing={2}>
        {filtered.map((member) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`,
              textAlign: 'center', position: 'relative', transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: (t) => `0 8px 24px ${alpha(t.palette.primary.main, 0.1)}` },
            }}>
              {canEdit && (
                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => openDialog(member)}><Edit sx={{ fontSize: 16 }} /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(member.id)}><Delete sx={{ fontSize: 16 }} /></IconButton>
                </Box>
              )}
              <Avatar src={member.photo_url} sx={{
                width: 72, height: 72, mx: 'auto', mb: 1.5,
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                fontSize: '1.6rem', fontWeight: 700,
              }}>
                {member.full_name?.charAt(0)}
              </Avatar>
              <Typography variant="subtitle1" fontWeight={700}>{member.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">{member.position || member.role || '—'}</Typography>
              <Chip label={member.status} size="small" sx={{ mt: 1, textTransform: 'capitalize', height: 22 }}
                color={member.status === 'active' ? 'success' : member.status === 'alumni' ? 'info' : 'default'} />
              {member.join_date && (
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  Joined {dayjs(member.join_date).format('MMM YYYY')}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Person sx={{ fontSize: 56, color: 'text.disabled' }} />
              <Typography color="text.secondary" sx={{ mt: 1 }}>No members found</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editMember ? 'Edit Member' : 'Add Member'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Full Name" {...register('full_name', { required: 'Required' })}
              error={!!errors.full_name} helperText={errors.full_name?.message} fullWidth />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Email" {...register('email')} fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Phone" {...register('phone')} fullWidth />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Role" {...register('role')} fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Position" {...register('position')} fullWidth />
              </Grid>
            </Grid>
            <TextField label="Biography" multiline rows={3} {...register('biography')} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select defaultValue={editMember?.status || 'active'} {...register('status')} label="Status">
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="alumni">Alumni</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{editMember ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default MemberListPage;
