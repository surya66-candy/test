import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Link, InputAdornment, IconButton, Alert, Divider, alpha,
} from '@mui/material';
import {
  Email, Lock, Visibility, VisibilityOff,
  Forum as ForumIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuthStore from '../store/authStore';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    clearError();
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, #0B0F1A 0%, #1a1040 50%, #0B0F1A 100%)`
            : `linear-gradient(135deg, #F8FAFC 0%, #E8E0FF 50%, #F8FAFC 100%)`,
      }}
    >
      {/* Animated background orbs */}
      <Box sx={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)}, transparent)`,
        top: -100, left: -100, animation: 'float 8s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30px, 30px) scale(1.1)' },
        },
      }} />
      <Box sx={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)}, transparent)`,
        bottom: -50, right: -50, animation: 'float2 10s ease-in-out infinite',
        '@keyframes float2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-20px, -20px) scale(1.15)' },
        },
      }} />

      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 460,
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(20px)',
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.85),
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64, height: 64, borderRadius: 3, mx: 'auto', mb: 2,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <ForumIcon sx={{ fontSize: 32, color: '#fff' }} />
            </Box>
            <Typography variant="h4" fontWeight={800} sx={{
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              ClubConnect
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sign in to your club forum
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email Address"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5 }}
            />

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ fontWeight: 500 }}>
                Forgot password?
              </Link>
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0, left: '-100%',
                  width: '100%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  animation: loading ? 'shimmer 1.5s infinite' : 'none',
                  '@keyframes shimmer': {
                    '100%': { left: '100%' },
                  },
                },
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              New here?
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            component={RouterLink}
            to="/register"
            sx={{ py: 1.2 }}
          >
            Create an Account
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
