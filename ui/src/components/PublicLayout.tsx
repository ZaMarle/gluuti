import { Box, Typography, Button, Stack } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { Routes } from '../routes';

export function PublicLayout() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#212121', color: '#ececec' }}>

      {/* Navbar */}
      <Box sx={{ borderBottom: '1px solid #404040', px: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
        <Typography
          onClick={() => navigate(Routes.LandingPage)}
          sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', cursor: 'pointer' }}
        >
          Gluuti
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(Routes.SignIn)}
            sx={{ borderColor: '#404040', color: '#ececec', textTransform: 'none', fontWeight: 500, '&:hover': { borderColor: '#666', bgcolor: 'rgba(255,255,255,0.04)' } }}
          >
            Sign in
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => navigate(Routes.SignUp)}
            sx={{ bgcolor: '#10a37f', '&:hover': { bgcolor: '#0d8f6f' }, textTransform: 'none', fontWeight: 600 }}
          >
            Sign up
          </Button>
        </Stack>
      </Box>

      <Outlet />

    </Box>
  );
}
