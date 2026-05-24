import { useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Stack,
  Chip, Select, MenuItem, FormControl, InputLabel, Tooltip,
} from '@mui/material';
import { usePortfolioContext } from '../context/PortfolioContext';
import { fmt } from '../utils/format';

export function TransactionsPage() {
  const { transactions, assets, deleteTransaction, openTransactionModal } = usePortfolioContext();
  const [filterAsset, setFilterAsset] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]));

  const filtered = [...transactions]
    .filter(t => filterAsset === 'all' || t.assetId === filterAsset)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by asset</InputLabel>
          <Select value={filterAsset} onChange={e => setFilterAsset(e.target.value)} label="Filter by asset">
            <MenuItem value="all">All assets</MenuItem>
            {assets.map(a => <MenuItem key={a.id} value={a.id}>{a.ticker}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" size="small" onClick={openTransactionModal}
          sx={{ bgcolor: '#10a37f', '&:hover': { bgcolor: '#0d8f6f' }, textTransform: 'none', fontWeight: 600 }}>
          + Transaction
        </Button>
      </Stack>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography sx={{ color: '#8e8ea0' }}>No transactions yet.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Shares</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Fees</TableCell>
                <TableCell sx={{ width: 80 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(tx => {
                const asset = assetMap[tx.assetId];
                const isBuy = tx.type === 'buy';
                return (
                  <TableRow key={tx.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.025)' } }}>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{fmt.date(tx.date)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{asset?.ticker ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isBuy ? 'BUY' : 'SELL'}
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.65rem', fontWeight: 700,
                          bgcolor: isBuy ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          color: isBuy ? '#22c55e' : '#ef4444',
                          border: `1px solid ${isBuy ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontSize: '0.875rem' }}>{fmt.qty(tx.quantity)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontSize: '0.875rem' }}>${fmt.currency(tx.pricePerUnit)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        ${fmt.currency(tx.quantity * tx.pricePerUnit)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontSize: '0.875rem', color: tx.fees > 0 ? '#ececec' : '#555' }}>
                        {tx.fees > 0 ? `$${fmt.currency(tx.fees)}` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {confirmDelete === tx.id ? (
                        <Stack direction="row" spacing={0.5}>
                          <Button size="small" onClick={() => deleteTransaction(tx.id)}
                            sx={{ color: '#ef4444', textTransform: 'none', minWidth: 0, fontSize: '0.72rem', px: 0.5 }}>
                            Yes
                          </Button>
                          <Button size="small" onClick={() => setConfirmDelete(null)}
                            sx={{ color: '#8e8ea0', textTransform: 'none', minWidth: 0, fontSize: '0.72rem', px: 0.5 }}>
                            No
                          </Button>
                        </Stack>
                      ) : (
                        <Tooltip title="Delete transaction">
                          <Button size="small" onClick={() => setConfirmDelete(tx.id)}
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
