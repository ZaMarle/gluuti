import { Box, Paper, Typography, Stack, Chip } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { usePortfolioContext } from '../context/PortfolioContext';
import { fmt } from '../utils/format';

const PALETTE = [
  '#10a37f', '#6366f1', '#f59e0b', '#ec4899',
  '#06b6d4', '#8b5cf6', '#ef4444', '#22c55e',
  '#f97316', '#14b8a6',
];

function MetricCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Paper sx={{ p: 2.5, flex: '1 1 160px', minWidth: 0 }}>
      <Typography sx={{ color: '#8e8ea0', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
        {label}
      </Typography>
      {children}
    </Paper>
  );
}

function PnLValue({ value, pct }: { value: number; pct?: number }) {
  const pos = value >= 0;
  const color = pos ? '#22c55e' : '#ef4444';
  return (
    <Box>
      <Typography sx={{ color, fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
        {pos ? '+' : '-'}${fmt.currency(Math.abs(value))}
      </Typography>
      {pct !== undefined && (
        <Typography sx={{ color, fontSize: '0.78rem', mt: 0.25 }}>{fmt.pct(pct)}</Typography>
      )}
    </Box>
  );
}

export function OverviewPage() {
  const { holdings, summary, transactions, assets } = usePortfolioContext();

  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]));

  const chartData = holdings
    .filter(h => h.currentValue > 0)
    .map((h, i) => ({
      id: h.asset.id,
      value: h.currentValue,
      label: h.asset.ticker,
      color: PALETTE[i % PALETTE.length],
    }));

  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <MetricCard label="Portfolio Value">
          <Typography sx={{ fontWeight: 700, fontSize: '1.35rem' }}>
            ${fmt.currency(summary.totalValue)}
          </Typography>
        </MetricCard>
        <MetricCard label="Unrealized P&L">
          <PnLValue value={summary.unrealizedPnL} pct={summary.unrealizedPnLPct} />
        </MetricCard>
        <MetricCard label="Realized P&L">
          <PnLValue value={summary.realizedPnL} />
        </MetricCard>
        <MetricCard label="Dividends Received">
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#10a37f' }}>
            ${fmt.currency(summary.totalDividends)}
          </Typography>
        </MetricCard>
        <MetricCard label="Total Return">
          <PnLValue value={summary.totalReturn} pct={summary.totalReturnPct} />
        </MetricCard>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper sx={{ flex: '1 1 300px', p: 2.5 }}>
          <Typography sx={{ color: '#8e8ea0', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2 }}>
            Allocation
          </Typography>
          {chartData.length > 0 ? (
            <PieChart
              series={[{ data: chartData, innerRadius: 55, paddingAngle: 2, cornerRadius: 3 }]}
              height={220}
              margin={{ top: 0, bottom: 0, left: 0, right: 120 }}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180 }}>
              <Typography sx={{ color: '#8e8ea0' }}>No holdings yet</Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ flex: '1 1 300px', p: 2.5 }}>
          <Typography sx={{ color: '#8e8ea0', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2 }}>
            Recent Transactions
          </Typography>
          {recent.length > 0 ? (
            <Stack spacing={1.5} divider={<Box sx={{ borderBottom: '1px solid #363636' }} />}>
              {recent.map(tx => {
                const asset = assetMap[tx.assetId];
                const isBuy = tx.type === 'buy';
                return (
                  <Stack key={tx.id} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.5} alignItems="center">
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
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>
                          {asset?.ticker ?? '?'} &times; {fmt.qty(tx.quantity)}
                        </Typography>
                        <Typography sx={{ color: '#8e8ea0', fontSize: '0.75rem' }}>
                          {fmt.date(tx.date)} &middot; ${fmt.currency(tx.pricePerUnit)}/sh
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      ${fmt.currency(tx.quantity * tx.pricePerUnit)}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180 }}>
              <Typography sx={{ color: '#8e8ea0' }}>No transactions yet</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
