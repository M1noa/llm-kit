# Finance Module 📈

The finance module provides stock market data using Yahoo Finance API, offering functionality for real-time quotes, historical data, company profiles, and stock symbol searches.

## Functions

### getStockQuote(symbol: string)

Get real-time stock quote information.

```typescript
import { getStockQuote } from "llm-kit";

// Get current stock quote
const quote = await getStockQuote("AAPL");
console.log(`${quote.symbol}: $${quote.price} ${quote.currency}`);
```

Returns a StockQuote object:

```typescript
interface StockQuote {
  symbol: string; // stock symbol
  price: number; // current price
  currency: string; // price currency
  change: number; // price change
  changePercent: number; // price change percentage
  marketCap?: number; // market capitalization
  volume?: number; // trading volume
  timestamp: Date; // quote timestamp
}
```

### getStockHistory(symbol: string, options?: HistoryOptions)

Get historical stock data.

```typescript
import { getStockHistory } from "llm-kit";

// Get daily data for the past month
const history = await getStockHistory("MSFT", {
  from: new Date("2023-01-01"),
  to: new Date("2023-12-31"),
  interval: "1d", // '1d' | '1wk' | '1mo'
});
```

Returns an array of StockHistory objects:

```typescript
interface StockHistory {
  date: Date; // trading date
  open: number; // opening price
  high: number; // highest price
  low: number; // lowest price
  close: number; // closing price
  volume: number; // trading volume
  adjClose: number; // adjusted closing price
}
```

### getCompanyProfile(symbol: string)

Get detailed company information.

```typescript
import { getCompanyProfile } from "llm-kit";

// Get company profile
const profile = await getCompanyProfile("GOOGL");
console.log(profile.longBusinessSummary);
```

Returns comprehensive company information including:

- Business summary
- Industry and sector
- Number of employees
- Company officers
- Key financial metrics
- And more...

### searchStocks(query: string)

Search for stock symbols and companies.

```typescript
import { searchStocks } from "llm-kit";

// Search for companies
const results = await searchStocks("apple");
console.log(results); // Array of matching stocks/companies
```

## Error Handling

All functions throw a SearchError on failure:

```typescript
try {
  const quote = await getStockQuote("INVALID");
} catch (err) {
  if (err.code === "FINANCE_QUOTE_ERROR") {
    console.log("Failed to get quote:", err.message);
  }
}
```

Error codes:

- FINANCE_QUOTE_ERROR: Failed to get stock quote
- FINANCE_HISTORY_ERROR: Failed to get historical data
- FINANCE_PROFILE_ERROR: Failed to get company profile
- FINANCE_SEARCH_ERROR: Failed to search stocks

## Tips

- Stock symbols should be in their exchange format (e.g., 'AAPL' for Apple Inc.)
- Historical data is adjusted for splits and dividends
- Consider using error handling for robust applications
- Data is provided in real-time but may have slight delays due to API constraints
