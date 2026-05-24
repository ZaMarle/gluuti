import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Asset, Transaction, Dividend, PortfolioState } from '../types';

const STORAGE_KEY = 'portfolio_v1';

const defaultState: PortfolioState = {
  assets: [],
  transactions: [],
  dividends: [],
  currentPrices: {},
};

function load(): PortfolioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PortfolioState) : defaultState;
  } catch {
    return defaultState;
  }
}

export function usePortfolio() {
  const [state, setState] = useState<PortfolioState>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addAsset = useCallback((ticker: string, name: string): Asset => {
    const asset: Asset = { id: uuidv4(), ticker: ticker.toUpperCase().trim(), name: name.trim() };
    setState(s => ({ ...s, assets: [...s.assets, asset] }));
    return asset;
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setState(s => ({
      ...s,
      assets: s.assets.filter(a => a.id !== id),
      transactions: s.transactions.filter(t => t.assetId !== id),
      dividends: s.dividends.filter(d => d.assetId !== id),
      currentPrices: Object.fromEntries(
        Object.entries(s.currentPrices).filter(([k]) => k !== id),
      ),
    }));
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    setState(s => ({ ...s, transactions: [...s.transactions, { ...tx, id: uuidv4() }] }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(s => ({ ...s, transactions: s.transactions.filter(t => t.id !== id) }));
  }, []);

  const addDividend = useCallback((div: Omit<Dividend, 'id'>) => {
    setState(s => ({ ...s, dividends: [...s.dividends, { ...div, id: uuidv4() }] }));
  }, []);

  const deleteDividend = useCallback((id: string) => {
    setState(s => ({ ...s, dividends: s.dividends.filter(d => d.id !== id) }));
  }, []);

  const setCurrentPrice = useCallback((assetId: string, price: number) => {
    setState(s => ({ ...s, currentPrices: { ...s.currentPrices, [assetId]: price } }));
  }, []);

  return {
    ...state,
    addAsset,
    deleteAsset,
    addTransaction,
    deleteTransaction,
    addDividend,
    deleteDividend,
    setCurrentPrice,
  };
}
