import { useState } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField,
  Button, Stack, Tooltip,
} from '@mui/material';
import { usePortfolioContext } from '../context/PortfolioContext';
import { fmt } from '../utils/format';

function PnLCell({ value, pct }: { value: number; pct?: number }) {
  const color = value >= 0 ? '#22c55e' : '#ef4444';
  const sign = value >= 0 ? '+' : '-';
  return (
    <Box>
      <Typography sx={{ color, fontWeight: 600, fontSize: '0.875rem' }}>
        {sign}${fmt.currency(Math.abs(value))}
      </Typography>
      {pct !== undefined && (
        <Typography sx={{ color, fontSize: '0.75rem' }}>{fmt.pct(pct)}</Typography>
      )}
    </Box>
  );
}

export function HoldingsPage() {
  const { holdings, setCurrentPrice, deleteAsset } = usePortfolioContext();
  const [editPrices, setEditPrices] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const activeHoldings = holdings.filter(h => h.quantity > 0);

  const handlePriceChange = (assetId: string, val: string) =>
    setEditPrices(p => ({ ...p, [assetId]: val }));

  const commitPrice = (assetId: string) => {
    const raw = editPrices[assetId];
    if (raw !== undefined) {
      const val = parseFloat(raw);
      if (!isNaN(val) && val > 0) setCurrentPrice(assetId, val);
      setEditPrices(p => { const n = { ...p }; delete n[assetId]; return n; });
    }
  };

  if (activeHoldings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography sx={{ color: '#8e8ea0', mb: 1 }}>No open positions.</Typography>
        <Typography variant="caption" sx={{ color: '#555' }}>
          Use "+ Add" above to record your first buy order.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell align="right">Shares</TableCell>
              <TableCell align="right">Avg Cost</TableCell>
              <TableCell align="right">Current Price</TableCell>
              <TableCell align="right">Market Value</TableCell>
              <TableCell align="right">Unrealized P&amp;L</TableCell>
              <TableCell align="right">Dividends</TableCell>
              <TableCell align="right" sx={{ width: 60 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeHoldings.map(h => (
              <TableRow key={h.asset.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.025)' } }}>
                <TableCell>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{h.asset.ticker}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontSize: '0.875rem' }}>{fmt.qty(h.quantity)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontSize: '0.875rem' }}>${fmt.currency(h.avgCost)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <TextField
                    value={editPrices[h.asset.id] !== undefined ? editPrices[h.asset.id] : h.currentPrice.toFixed(2)}
                    onChange={e => handlePriceChange(h.asset.id, e.target.value)}
                    onBlur={() => commitPrice(h.asset.id)}
                    onKeyDown={e => e.key === 'Enter' && commitPrice(h.asset.id)}
                    type="number"
                    size="small"
                    inputProps={{ min: 0, step: 'any', style: { textAlign: 'right', padding: '4px 8px', fontSize: '0.875rem' } }}
                    sx={{ width: 110, '& fieldset': { borderColor: '#404040' } }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    ${fmt.currency(h.currentValue)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <PnLCell value={h.unrealizedPnL} pct={h.unrealizedPnLPct} />
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontSize: '0.875rem', color: h.totalDividends > 0 ? '#10a37f' : '#555' }}>
                    {h.totalDividends > 0 ? `$${fmt.currency(h.totalDividends)}` : '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {confirmDelete === h.asset.id ? (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Button size="small" onClick={() => deleteAsset(h.asset.id)}
                        sx={{ color: '#ef4444', textTransform: 'none', minWidth: 0, fontSize: '0.75rem', px: 1 }}>
                        Confirm
                      </Button>
                      <Button size="small" onClick={() => setConfirmDelete(null)}
                        sx={{ color: '#8e8ea0', textTransform: 'none', minWidth: 0, fontSize: '0.75rem', px: 1 }}>
                        Cancel
                      </Button>
                    </Stack>
                  ) : (
                    <Tooltip title="Remove asset and all its data">
                      <Button size="small" onClick={() => setConfirmDelete(h.asset.id)}
                        sx={{ color: '#555', textTransform: 'none', minWidth: 0, fontSize: '1rem', '&:hover': { color: '#ef4444' } }}>
                        ✕
                      </Button>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" sx={{ color: '#555', mt: 1.5, display: 'block' }}>
        Click the current price field to update it. Press Enter or click away to save.
      </Typography>
    </>
  );
}
