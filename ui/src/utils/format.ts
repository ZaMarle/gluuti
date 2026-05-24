export const fmt = {
  currency: (n: number, decimals = 2) =>
    n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),

  pct: (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`,

  qty: (n: number) =>
    n.toLocaleString('en-US', { maximumFractionDigits: 6 }),

  date: (s: string) =>
    new Date(s + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
};
