import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import useAuthStore from '../../store/authStore';

const AuthGuard = ({ children }) => {
  const { user, loading, initialize } = useAuthStore();
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initialize();
      setInitialized(true);
    };
    init();
  }, [initialize]);

  if (!initialized || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: (theme) => theme.palette.background.default,
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGuard;
