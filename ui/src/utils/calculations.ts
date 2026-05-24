import type { Asset, Transaction, Dividend, Holding, PortfolioSummary } from '../types';

type HoldingState = {
  quantity: number;
  avgCost: number;
  realizedPnL: number;
  lastPrice: number;
};

export function computeHoldings(
  assets: Asset[],
  transactions: Transaction[],
  dividends: Dividend[],
  currentPrices: Record<string, number>,
): Holding[] {
  const map: Record<string, HoldingState> = {};

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  for (const tx of sorted) {
    if (!map[tx.assetId]) {
      map[tx.assetId] = { quantity: 0, avgCost: 0, realizedPnL: 0, lastPrice: tx.pricePerUnit };
    }
    const h = map[tx.assetId];
    h.lastPrice = tx.pricePerUnit;

    if (tx.type === 'buy') {
      const newQty = h.quantity + tx.quantity;
      h.avgCost = newQty > 0
        ? (h.quantity * h.avgCost + tx.quantity * tx.pricePerUnit) / newQty
        : 0;
      h.quantity = newQty;
    } else {
      h.realizedPnL += (tx.pricePerUnit - h.avgCost) * tx.quantity - tx.fees;
      h.quantity = Math.max(0, h.quantity - tx.quantity);
      if (h.quantity < 1e-9) {
        h.quantity = 0;
        h.avgCost = 0;
      }
    }
  }

  const divMap: Record<string, number> = {};
  for (const d of dividends) {
    divMap[d.assetId] = (divMap[d.assetId] ?? 0) + d.amount;
  }

  return assets
    .map((asset): Holding => {
      const h: HoldingState = map[asset.id] ?? { quantity: 0, avgCost: 0, realizedPnL: 0, lastPrice: 0 };
      const currentPrice = currentPrices[asset.id] ?? h.lastPrice;
      const currentValue = h.quantity * currentPrice;
      const costBasis = h.quantity * h.avgCost;
      const unrealizedPnL = currentValue - costBasis;
      const unrealizedPnLPct = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;

      return {
        asset,
        quantity: h.quantity,
        avgCost: h.avgCost,
        currentPrice,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPct,
        realizedPnL: h.realizedPnL,
        totalDividends: divMap[asset.id] ?? 0,
      };
    })
    .filter(h => h.quantity > 0 || h.realizedPnL !== 0 || h.totalDividends > 0);
}

export function computeSummary(holdings: Holding[]): PortfolioSummary {
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalCost = holdings.reduce((s, h) => s + h.quantity * h.avgCost, 0);
  const unrealizedPnL = totalValue - totalCost;
  const unrealizedPnLPct = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;
  const realizedPnL = holdings.reduce((s, h) => s + h.realizedPnL, 0);
  const totalDividends = holdings.reduce((s, h) => s + h.totalDividends, 0);
  const totalReturn = unrealizedPnL + realizedPnL + totalDividends;
  const totalReturnPct = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

  return { totalValue, totalCost, unrealizedPnL, unrealizedPnLPct, realizedPnL, totalDividends, totalReturn, totalReturnPct };
}
