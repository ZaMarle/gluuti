import { useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Stack,
  Select, MenuItem, FormControl, InputLabel, Tooltip,
} from '@mui/material';
import { usePortfolioContext } from '../context/PortfolioContext';
import { fmt } from '../utils/format';

export function DividendsPage() {
  const { dividends, assets, deleteDividend, openDividendModal } = usePortfolioContext();
  const [filterAsset, setFilterAsset] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]));

  const filtered = [...dividends]
    .filter(d => filterAsset === 'all' || d.assetId === filterAsset)
    .sort((a, b) => b.date.localeCompare(a.date));

  const total = filtered.reduce((s, d) => s + d.amount, 0);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter by asset</InputLabel>
            <Select value={filterAsset} onChange={e => setFilterAsset(e.target.value)} label="Filter by asset">
              <MenuItem value="all">All assets</MenuItem>
              {assets.map(a => <MenuItem key={a.id} value={a.id}>{a.ticker}</MenuItem>)}
            </Select>
          </FormControl>
          {filtered.length > 0 && (
            <Typography sx={{ color: '#10a37f', fontSize: '0.875rem', fontWeight: 600 }}>
              Total: ${fmt.currency(total)}
            </Typography>
          )}
        </Stack>
        <Button variant="contained" size="small" onClick={openDividendModal}
          sx={{ bgcolor: '#10a37f', '&:hover': { bgcolor: '#0d8f6f' }, textTransform: 'none', fontWeight: 600 }}>
          + Dividend
        </Button>
      </Stack>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography sx={{ color: '#8e8ea0' }}>No dividends recorded yet.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell sx={{ width: 80 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(div => {
                const asset = assetMap[div.assetId];
                return (
                  <TableRow key={div.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.025)' } }}>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{fmt.date(div.date)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{asset?.ticker ?? '—'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#10a37f' }}>
                        +${fmt.currency(div.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {confirmDelete === div.id ? (
                        <Stack direction="row" spacing={0.5}>
                          <Button size="small" onClick={() => deleteDividend(div.id)}
                            sx={{ color: '#ef4444', textTransform: 'none', minWidth: 0, fontSize: '0.72rem', px: 0.5 }}>
                            Yes
                          </Button>
                          <Button size="small" onClick={() => setConfirmDelete(null)}
                            sx={{ color: '#8e8ea0', textTransform: 'none', minWidth: 0, fontSize: '0.72rem', px: 0.5 }}>
                            No
                          </Button>
                        </Stack>
                      ) : (
                        <Tooltip title="Delete dividend">
                          <Button size="small" onClick={() => setConfirmDelete(div.id)}
                            sx={{ color: '#555', textTransform: 'none', minWidth: 0, '&:hover': { color: '#ef4444' } }}>
                            ✕
                          </Button>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
