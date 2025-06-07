// finance.ts - handles stock market data using yahoo finance

import yahooFinance from 'yahoo-finance2';
import { SearchError } from '../types';

// interfaces for finance data
export interface StockQuote {
  symbol: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
  timestamp: Date;
}

export interface StockHistory {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

// get current stock quote
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    console.log(`Fetching quote for ${symbol}...`);
    const quote = await yahooFinance.quote(symbol);

    if (!quote?.regularMarketPrice || !quote?.currency || !quote?.regularMarketTime) {
      throw new Error('Missing required quote data');
    }

    const stockQuote: StockQuote = {
      symbol: quote.symbol || symbol,
      price: Number(quote.regularMarketPrice),
      currency: quote.currency,
      change: Number(quote.regularMarketChange) || 0,
      changePercent: Number(quote.regularMarketChangePercent) || 0,
      marketCap: quote.marketCap ? Number(quote.marketCap) : undefined,
      volume: quote.regularMarketVolume ? Number(quote.regularMarketVolume) : undefined,
      timestamp: new Date(Number(quote.regularMarketTime) * 1000)
    };

    return stockQuote;
  } catch (error) {
    throw {
      message: `Failed to get stock quote: ${error instanceof Error ? error.message : String(error)}`,
      code: 'FINANCE_QUOTE_ERROR',
      originalError: error
    } as SearchError;
  }
}

// get historical stock data
export async function getStockHistory(symbol: string, options: {
  from?: Date;
  to?: Date;
  interval?: '1d' | '1wk' | '1mo';
} = {}): Promise<StockHistory[]> {
  try {
    console.log(`Fetching historical data for ${symbol}...`);

    // Convert dates to timestamps for yahoo-finance2
    const params: any = {
      interval: options.interval || '1d'
    };

    if (options.from) {
      params.period1 = Math.floor(options.from.getTime() / 1000);
    }
    if (options.to) {
      params.period2 = Math.floor(options.to.getTime() / 1000);
    }

    const result = await yahooFinance.historical(symbol, params);

    return result.map(row => {
      if (!row.adjClose) {
        throw new Error('Missing adjusted close price in historical data');
      }

      const history: StockHistory = {
        date: new Date(row.date),
        open: Number(row.open),
        high: Number(row.high),
        low: Number(row.low),
        close: Number(row.close),
        volume: Number(row.volume),
        adjClose: Number(row.adjClose)
      };

      return history;
    });
  } catch (error) {
    throw {
      message: `Failed to get historical data: ${error instanceof Error ? error.message : String(error)}`,
      code: 'FINANCE_HISTORY_ERROR',
      originalError: error
    } as SearchError;
  }
}

// get company profile
export async function getCompanyProfile(symbol: string): Promise<any> {
  try {
    console.log(`Fetching company profile for ${symbol}...`);
    const result = await yahooFinance.quoteSummary(symbol, {
      modules: ['assetProfile', 'summaryProfile', 'summaryDetail']
    });

    return {
      ...result.assetProfile,
      ...result.summaryProfile,
      ...result.summaryDetail
    };
  } catch (error) {
    throw {
      message: `Failed to get company profile: ${error instanceof Error ? error.message : String(error)}`,
      code: 'FINANCE_PROFILE_ERROR',
      originalError: error
    } as SearchError;
  }
}

// search for stock symbols
export async function searchStocks(query: string): Promise<any[]> {
  try {
    console.log(`Searching stocks for "${query}"...`);
    const results = await yahooFinance.search(query);
    return results.quotes || [];
  } catch (error) {
    throw {
      message: `Failed to search stocks: ${error instanceof Error ? error.message : String(error)}`,
      code: 'FINANCE_SEARCH_ERROR',
      originalError: error
    } as SearchError;
  }
}
