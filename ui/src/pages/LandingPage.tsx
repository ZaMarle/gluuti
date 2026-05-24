import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../routes';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 52px)',
        display: 'flex',
        alignItems: 'center',
        px: { xs: 3, sm: 8, md: 12 },
      }}
    >
      <Stack spacing={4} sx={{ maxWidth: 600 }}>
        <Typography
          sx={{
            fontSize: { xs: '2.5rem', sm: '3.25rem' },
            fontWeight: 800,
            color: '#ececec',
            letterSpacing: '-0.04em',
            lineHeight: 1.15,
          }}
        >
          One place for every trade,{' '}
          <Box component="span" sx={{ color: '#10a37f' }}>
            dividend, and return.
          </Box>
        </Typography>

        <Typography sx={{ color: '#8e8ea0', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: 480 }}>
          Log every buy, sell, and dividend. See your true P&amp;L, cost basis, and total return — clearly, instantly, always up to date.
        </Typography>

        <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(Routes.SignUp)}
            sx={{ bgcolor: '#10a37f', '&:hover': { bgcolor: '#0d8f6f' }, textTransform: 'none', fontWeight: 700, px: 3.5, fontSize: '1rem' }}
          >
            Get started free
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate(Routes.SignIn)}
            sx={{ borderColor: '#404040', color: '#ececec', textTransform: 'none', fontWeight: 500, px: 3.5, fontSize: '1rem', '&:hover': { borderColor: '#666', bgcolor: 'rgba(255,255,255,0.04)' } }}
          >
            Sign in
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
