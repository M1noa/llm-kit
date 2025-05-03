// search.ts - handles searching stuff using google and ddg cause why not both

import { search as googleSearch, SearchResultNodeLike } from "google-sr";
import { search as duckSearch, SafeSearchType } from "duck-duck-scrape";
import { SearchOptions, SearchResult, SearchError } from "../types";

const defaultOptions: SearchOptions = {
  limit: 10,
  safeSearch: true,
  timeout: 10000,
};

// Rate limiting parameters
const MIN_DELAY_BETWEEN_SEARCHES = 2000; // 2 seconds for DuckDuckGo
const GOOGLE_DELAY = 1000; // 1 second for Google
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second between retries

let lastDDGSearchTime = 0;
let lastGoogleSearchTime = 0;

// Cache for search results
const searchCache = new Map<
  string,
  {
    results: SearchResult[];
    timestamp: number;
    source: "google" | "duckduckgo";
  }
>();

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Helper function to enforce rate limiting
async function enforceRateLimit(searchType: "ddg" | "google") {
  const now = Date.now();
  const delay =
    searchType === "ddg" ? MIN_DELAY_BETWEEN_SEARCHES : GOOGLE_DELAY;
  const lastTime =
    searchType === "ddg" ? lastDDGSearchTime : lastGoogleSearchTime;

  const timeSinceLastSearch = now - lastTime;

  if (timeSinceLastSearch < delay) {
    await new Promise((resolve) =>
      setTimeout(resolve, delay - timeSinceLastSearch)
    );
  }

  if (searchType === "ddg") {
    lastDDGSearchTime = Date.now();
  } else {
    lastGoogleSearchTime = Date.now();
  }
}

// Helper function to get cache key
function getCacheKey(query: string, options: SearchOptions): string {
  return `${query}-${JSON.stringify(options)}`;
}

export async function searchGoogle(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  try {
    const cacheKey = getCacheKey(query, options);
    const cached = searchCache.get(cacheKey);
    if (
      cached &&
      cached.source === "google" &&
      Date.now() - cached.timestamp < CACHE_TTL
    ) {
      return cached.results;
    }

    await enforceRateLimit("google");

    const opts = { ...defaultOptions, ...options };

    const results = await googleSearch({
      query,
      requestConfig: {
        timeout: opts.timeout,
        params: {
          safe: opts.safeSearch ? "active" : "off",
        },
      },
    });

    const formattedResults = results.map((r: SearchResultNodeLike) => ({
      title: (r as any).title || "",
      url: (r as any).link || "",
      snippet: (r as any).description || "",
      source: "google" as const,
    }));

    searchCache.set(cacheKey, {
      results: formattedResults,
      timestamp: Date.now(),
      source: "google",
    });

    return formattedResults;
  } catch (error) {
    throw {
      message: "google search failed :(",
      code: "GOOGLE_SEARCH_ERROR",
      originalError: error,
    } as SearchError;
  }
}

export async function searchDuckDuckGo(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const cacheKey = getCacheKey(query, options);
  const cached = searchCache.get(cacheKey);
  if (
    cached &&
    cached.source === "duckduckgo" &&
    Date.now() - cached.timestamp < CACHE_TTL
  ) {
    return cached.results;
  }

  let lastError: any;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await enforceRateLimit("ddg");

      const opts = { ...defaultOptions, ...options };

      const results = await duckSearch(query, {
        safeSearch: opts.safeSearch
          ? SafeSearchType.STRICT
          : SafeSearchType.OFF,
      });

      const formattedResults = results.results
        .slice(0, opts.limit)
        .map((r) => ({
          title: r.title,
          url: r.url,
          snippet: r.description,
          source: "duckduckgo" as const,
        }));

      searchCache.set(cacheKey, {
        results: formattedResults,
        timestamp: Date.now(),
        source: "duckduckgo",
      });

      return formattedResults;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        console.warn(
          `DuckDuckGo search attempt ${attempt} failed, retrying in ${
            RETRY_DELAY / 1000
          } seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  throw {
    message: "duckduckgo search failed :/",
    code: "DDG_SEARCH_ERROR",
    originalError: lastError,
  } as SearchError;
}

// unified search that tries ddg first, then google
export async function search(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  try {
    return await searchDuckDuckGo(query, options);
  } catch (err) {
    // fallback to google if ddg fails
    console.warn("duckduckgo search failed, falling back to google...", err);
    return await searchGoogle(query, options);
  }
}
