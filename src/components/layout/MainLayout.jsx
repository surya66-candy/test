import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DRAWER_WIDTH = 280;

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: (t) => t.palette.background.default }}>
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isMobile={isMobile}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
          transition: 'margin 0.3s ease',
          minHeight: '100vh',
        }}
      >
        <TopBar
          onMenuClick={() => setMobileOpen(true)}
          isMobile={isMobile}
        />
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            mt: '64px',
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
