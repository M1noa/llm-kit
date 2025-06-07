// index.ts - main entry point for the package

// export all our cool modules
export * from "./modules/search";
export * from "./modules/wikipedia";
export * from "./modules/hackernews";
export * from "./modules/webpage";
export * from "./modules/parser";
export * from "./modules/news"; // woohoo news search!
export * from "./modules/urbandictionary"; // urban dictionary for the slang enthusiasts
export * from "./modules/autocomplete"; // search suggestions from everywhere
export * from "./modules/reddit"; // reddit integration
export {
  getStockQuote,
  getStockHistory,
  getCompanyProfile,
  searchStocks,
  StockQuote,
  StockHistory,
} from "./modules/finance"; // financial data from yahoo finance

// export types
export * from "./types";

// version info
export const VERSION = "1.0.1";
export const AUTHOR = "llm-kit";

// default config
export const DEFAULT_TIMEOUT = 10000;
export const DEFAULT_LIMIT = 10;

// debug info
console.debug("llm-kit initialized... lets find some stuff!");
console.debug(`version: ${VERSION}`);
