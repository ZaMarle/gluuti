import { createContext, useContext, useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { computeHoldings, computeSummary } from '../utils/calculations';
import type { Holding, PortfolioSummary } from '../types';

interface PortfolioContextValue extends ReturnType<typeof usePortfolio> {
  holdings: Holding[];
  summary: PortfolioSummary;
  txOpen: boolean;
  divOpen: boolean;
  openTransactionModal: () => void;
  openDividendModal: () => void;
  closeTransactionModal: () => void;
  closeDividendModal: () => void;
}

const PortfolioContext = createContext<PortfolioContextValue>(null!);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const portfolio = usePortfolio();
  const [txOpen, setTxOpen] = useState(false);
  const [divOpen, setDivOpen] = useState(false);

  const holdings = computeHoldings(
    portfolio.assets,
    portfolio.transactions,
    portfolio.dividends,
    portfolio.currentPrices,
  );
  const summary = computeSummary(holdings);

  return (
    <PortfolioContext.Provider value={{
      ...portfolio,
      holdings,
      summary,
      txOpen,
      divOpen,
      openTransactionModal: () => setTxOpen(true),
      openDividendModal: () => setDivOpen(true),
      closeTransactionModal: () => setTxOpen(false),
      closeDividendModal: () => setDivOpen(false),
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolioContext = () => useContext(PortfolioContext);
