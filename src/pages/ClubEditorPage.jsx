import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, Button, Grid, alpha,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import useClubStore from '../store/clubStore';
import toast from 'react-hot-toast';

const ClubEditorPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentClub, fetchClubBySlug, createClub, updateClub } = useClubStore();
  const isNew = !slug || slug === 'new';
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!isNew && slug) {
      fetchClubBySlug(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (!isNew && currentClub) {
      reset({
        name: currentClub.name || '',
        description: currentClub.description || '',
        mission_statement: currentClub.mission_statement || '',
        contact_email: currentClub.contact_email || '',
        phone: currentClub.phone || '',
        establishment_date: currentClub.establishment_date || '',
      });
    }
  }, [currentClub]);

  const onSubmit = async (data) => {
    setLoading(true);
    const slug_val = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = { ...data, slug: slug_val };

    let result;
    if (isNew) {
      result = await createClub(payload);
    } else {
      result = await updateClub(currentClub.id, payload);
    }

    if (result.success) {
      toast.success(isNew ? 'Club created!' : 'Club updated!');
      navigate(`/clubs/${slug_val}`);
    } else {
      toast.error(result.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h5" fontWeight={800}>
          {isNew ? 'Create New Club' : `Edit ${currentClub?.name || 'Club'}`}
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, maxWidth: 800 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Club Name" {...register('name', { required: 'Required' })}
                error={!!errors.name} helperText={errors.name?.message} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={4} {...register('description')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Mission Statement" multiline rows={2} {...register('mission_statement')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Contact Email" type="email" {...register('contact_email')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" {...register('phone')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Establishment Date" type="date"
                InputLabelProps={{ shrink: true }} {...register('establishment_date')} />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<Save />} disabled={loading}>
                  {loading ? 'Saving...' : isNew ? 'Create Club' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ClubEditorPage;
