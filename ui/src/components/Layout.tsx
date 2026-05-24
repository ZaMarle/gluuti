import { Box, Tabs, Tab, Typography, Button, Menu, MenuItem, Avatar, IconButton, Divider } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Routes } from '../routes';
import { usePortfolioContext } from '../context/PortfolioContext';
import { AddTransactionModal } from './AddTransactionModal';
import { AddDividendModal } from './AddDividendModal';

const NAV_TABS = [
  { label: 'Overview',     path: Routes.Overview },
  { label: 'Holdings',     path: Routes.Holdings },
  { label: 'Transactions', path: Routes.Transactions },
  { label: 'Dividends',    path: Routes.Dividends },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [addAnchor, setAddAnchor] = useState<null | HTMLElement>(null);

  const {
    assets, transactions, dividends,
    addTransaction, addDividend, addAsset,
    txOpen, divOpen,
    openTransactionModal, openDividendModal,
    closeTransactionModal, closeDividendModal,
  } = usePortfolioContext();

  const tabIndex = NAV_TABS.findIndex(t => t.path === location.pathname);
  const activeTab = tabIndex === -1 ? 0 : tabIndex;

  const handleAddMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAddAnchor(e.currentTarget);
  const handleAddMenuClose = () => setAddAnchor(null);

  const openTx = () => { handleAddMenuClose(); openTransactionModal(); };
  const openDiv = () => { handleAddMenuClose(); openDividendModal(); };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#212121', color: '#ececec' }}>

      {/* Navbar */}
      <Box sx={{ borderBottom: '1px solid #404040', px: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', height: 52, gap: 2 }}>

        <Typography
          onClick={() => navigate(Routes.Overview)}
          sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap', mr: 1, cursor: 'pointer' }}
        >
          Gluuti
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(_, i: number) => navigate(NAV_TABS[i].path)}
          TabIndicatorProps={{ style: { backgroundColor: '#10a37f', height: 2 } }}
          sx={{ flex: 1, minHeight: 52, '& .MuiTabs-flexContainer': { height: 52 } }}
        >
          {NAV_TABS.map((t, i) => (
            <Tab
              key={t.path}
              label={t.label}
              sx={{
                minHeight: 52,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                color: activeTab === i ? '#ececec' : '#8e8ea0',
                '&.Mui-selected': { color: '#ececec' },
              }}
            />
          ))}
        </Tabs>

        <Button
          variant="contained"
          size="small"
          onClick={handleAddMenuOpen}
          sx={{ bgcolor: '#10a37f', '&:hover': { bgcolor: '#0d8f6f' }, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          + Add ▾
        </Button>

        <Menu
          anchorEl={addAnchor}
          open={Boolean(addAnchor)}
          onClose={handleAddMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { bgcolor: '#2f2f2f', border: '1px solid #404040', minWidth: 170, mt: 0.5 } }}
        >
          <MenuItem onClick={openTx} sx={{ fontSize: '0.9rem', gap: 1.5 }}>
            <Box component="span" sx={{ color: '#22c55e', fontWeight: 700 }}>↑</Box>
            Transaction
          </MenuItem>
          <Divider sx={{ borderColor: '#404040', my: 0.5 }} />
          <MenuItem onClick={openDiv} sx={{ fontSize: '0.9rem', gap: 1.5 }}>
            <Box component="span" sx={{ color: '#10a37f', fontWeight: 700 }}>$</Box>
            Dividend
          </MenuItem>
        </Menu>

        <IconButton size="small" sx={{ p: 0 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#10a37f', fontSize: '0.8rem', fontWeight: 700 }}>
            ZM
          </Avatar>
        </IconButton>

      </Box>

      {/* Page content */}
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, maxWidth: 1400, mx: 'auto' }}>
        <Outlet />
      </Box>

      <AddTransactionModal
        open={txOpen}
        onClose={closeTransactionModal}
        assets={assets}
        onAdd={addTransaction}
        onCreateAsset={addAsset}
      />
      <AddDividendModal
        open={divOpen}
        onClose={closeDividendModal}
        assets={assets}
        onAdd={addDividend}
      />

    </Box>
  );
}
