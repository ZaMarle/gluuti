export type TransactionType = 'buy' | 'sell';

export interface Asset {
  id: string;
  ticker: string;
  name: string;
}

export interface Transaction {
  id: string;
  assetId: string;
  type: TransactionType;
  date: string;
  quantity: number;
  pricePerUnit: number;
  fees: number;
}

export interface Dividend {
  id: string;
  assetId: string;
  date: string;
  amount: number;
}

export interface Holding {
  asset: Asset;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  realizedPnL: number;
  totalDividends: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  realizedPnL: number;
  totalDividends: number;
  totalReturn: number;
  totalReturnPct: number;
}

export interface PortfolioState {
  assets: Asset[];
  transactions: Transaction[];
  dividends: Dividend[];
  currentPrices: Record<string, number>;
}
