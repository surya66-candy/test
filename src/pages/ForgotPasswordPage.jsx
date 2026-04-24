import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Link, InputAdornment, Alert, alpha,
} from '@mui/material';
import { Email, ArrowBack, Forum as ForumIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuthStore from '../store/authStore';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await resetPassword(data.email);
    if (result.success) setSent(true);
    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: (theme) => theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #0B0F1A 0%, #1a1040 50%, #0B0F1A 100%)'
        : 'linear-gradient(135deg, #F8FAFC 0%, #E8E0FF 50%, #F8FAFC 100%)',
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{
          maxWidth: 460, mx: 'auto', p: { xs: 3, sm: 5 }, borderRadius: 4,
          border: (t) => `1px solid ${t.palette.divider}`,
          backdropFilter: 'blur(20px)',
          backgroundColor: (t) => alpha(t.palette.background.paper, 0.85),
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
              background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ForumIcon sx={{ fontSize: 28, color: '#fff' }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>Reset Password</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Enter your email and we&apos;ll send you a reset link
            </Typography>
          </Box>

          {sent ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Password reset email sent! Check your inbox.
              </Alert>
              <Button component={RouterLink} to="/login" variant="contained" startIcon={<ArrowBack />}>
                Back to Login
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField fullWidth label="Email Address" {...register('email')}
                error={!!errors.email} helperText={errors.email?.message}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
                }}
                sx={{ mb: 3 }}
              />
              <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.4, mb: 2 }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2" sx={{ fontWeight: 500 }}>
                  ← Back to Login
                </Link>
              </Box>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
