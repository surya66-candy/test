import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Link, InputAdornment, IconButton, Alert, Stepper, Step,
  StepLabel, alpha, Grid,
} from '@mui/material';
import {
  Email, Lock, Visibility, VisibilityOff, Person,
  Business, ArrowBack, ArrowForward, Forum as ForumIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuthStore from '../store/authStore';
import { authApi } from '../services/api';

const step1Schema = yup.object({
  full_name: yup.string().required('Full name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Minimum 8 characters').required('Password is required'),
  confirm_password: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

const step2Schema = yup.object({
  club_name: yup.string().required('Club name is required'),
  club_description: yup.string().required('Club description is required'),
  contact_email: yup.string().email('Enter a valid email'),
});

const steps = ['Personal Info', 'Club Details'];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [step1Data, setStep1Data] = useState(null);
  const [success, setSuccess] = useState(false);

  const form1 = useForm({ resolver: yupResolver(step1Schema) });
  const form2 = useForm({ resolver: yupResolver(step2Schema) });

  const handleStep1 = (data) => {
    setStep1Data(data);
    setActiveStep(1);
  };

  const handleStep2 = async (data) => {
    setLoading(true);
    clearError();
    try {
      // Call backend API to register user + create club + assign roles
      await authApi.registerClub({
        email: step1Data.email,
        password: step1Data.password,
        full_name: step1Data.full_name,
        club_name: data.club_name,
        club_description: data.club_description,
        contact_email: data.contact_email || step1Data.email,
      });

      // Auto-login after successful registration
      const loginResult = await login(step1Data.email, step1Data.password);
      if (loginResult.success) {
        navigate('/dashboard');
        return;
      }
      // If auto-login fails, show success and redirect to login
      setSuccess(true);
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Registration failed';
      useAuthStore.setState({ error: msg });
    }
    setLoading(false);
  };

  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0B0F1A 0%, #1a1040 50%, #0B0F1A 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #E8E0FF 50%, #F8FAFC 100%)',
      }}>
        <Paper sx={{ p: 5, borderRadius: 4, textAlign: 'center', maxWidth: 460, mx: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
          <Box sx={{ width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
            background: (t) => `linear-gradient(135deg, ${t.palette.success.main}, ${t.palette.success.dark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h3" sx={{ color: '#fff' }}>✓</Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>Registration Successful!</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Your account and club have been created. You can now sign in.
          </Typography>
          <Button variant="contained" component={RouterLink} to="/login">Go to Login</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden',
      background: (theme) => theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #0B0F1A 0%, #1a1040 50%, #0B0F1A 100%)'
        : 'linear-gradient(135deg, #F8FAFC 0%, #E8E0FF 50%, #F8FAFC 100%)',
    }}>
      <Box sx={{
        position: 'absolute', width: 350, height: 350, borderRadius: '50%',
        background: (t) => `radial-gradient(circle, ${alpha(t.palette.primary.main, 0.12)}, transparent)`,
        top: -80, right: -80, animation: 'float 8s ease-in-out infinite',
        '@keyframes float': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(20px)' } },
      }} />

      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper elevation={0} sx={{
          width: '100%', maxWidth: 520, p: { xs: 3, sm: 5 }, borderRadius: 4,
          border: (t) => `1px solid ${t.palette.divider}`,
          backdropFilter: 'blur(20px)',
          backgroundColor: (t) => alpha(t.palette.background.paper, 0.85),
          position: 'relative', zIndex: 1,
        }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
              background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: (t) => `0 8px 32px ${alpha(t.palette.primary.main, 0.3)}`,
            }}>
              <ForumIcon sx={{ fontSize: 28, color: '#fff' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{
              background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Create Account
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={clearError}>{error}</Alert>}

          {activeStep === 0 && (
            <form onSubmit={form1.handleSubmit(handleStep1)}>
              <TextField fullWidth label="Full Name" {...form1.register('full_name')}
                error={!!form1.formState.errors.full_name}
                helperText={form1.formState.errors.full_name?.message}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                sx={{ mb: 2 }}
              />
              <TextField fullWidth label="Email Address" {...form1.register('email')}
                error={!!form1.formState.errors.email}
                helperText={form1.formState.errors.email?.message}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                sx={{ mb: 2 }}
              />
              <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'}
                {...form1.register('password')}
                error={!!form1.formState.errors.password}
                helperText={form1.formState.errors.password?.message}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
              <TextField fullWidth label="Confirm Password" type="password"
                {...form1.register('confirm_password')}
                error={!!form1.formState.errors.confirm_password}
                helperText={form1.formState.errors.confirm_password?.message}
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                sx={{ mb: 3 }}
              />
              <Button fullWidth type="submit" variant="contained" size="large" endIcon={<ArrowForward />} sx={{ py: 1.4 }}>
                Continue
              </Button>
            </form>
          )}

          {activeStep === 1 && (
            <form onSubmit={form2.handleSubmit(handleStep2)}>
              <TextField fullWidth label="Club Name" {...form2.register('club_name')}
                error={!!form2.formState.errors.club_name}
                helperText={form2.formState.errors.club_name?.message}
                InputProps={{ startAdornment: <InputAdornment position="start"><Business sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                sx={{ mb: 2 }}
              />
              <TextField fullWidth label="Club Description" multiline rows={3}
                {...form2.register('club_description')}
                error={!!form2.formState.errors.club_description}
                helperText={form2.formState.errors.club_description?.message}
                sx={{ mb: 2 }}
              />
              <TextField fullWidth label="Contact Email (optional)" {...form2.register('contact_email')}
                error={!!form2.formState.errors.contact_email}
                helperText={form2.formState.errors.contact_email?.message}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                sx={{ mb: 3 }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button fullWidth variant="outlined" onClick={() => setActiveStep(0)} startIcon={<ArrowBack />} sx={{ py: 1.4 }}>
                    Back
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.4 }}>
                    {loading ? 'Creating...' : 'Register'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" fontWeight={600}>Sign In</Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
