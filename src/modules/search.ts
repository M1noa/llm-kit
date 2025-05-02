// search.ts - handles searching stuff using google and ddg cause why not both

import { search as googleSearch, SearchResultNodeLike } from 'google-sr';
import { search as duckSearch, SafeSearchType } from 'duck-duck-scrape';
import { SearchOptions, SearchResult, SearchError } from '../types';

const defaultOptions: SearchOptions = {
  limit: 10,
  safeSearch: true,
  timeout: 10000
};

export async function searchGoogle(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
  try {
    // merge with defaults
    const opts = { ...defaultOptions, ...options };
    
    // do the google search
    const results = await googleSearch({
      query,
      requestConfig: {
        timeout: opts.timeout,
        params: {
          safe: opts.safeSearch ? 'active' : 'off'
        }
      }
    });

    // convert to our format
    return results.map((r: SearchResultNodeLike) => ({
      title: (r as any).title || '',
      url: (r as any).link || '', // use link instead of url
      snippet: (r as any).description || '',
      source: 'google' as const
    }));
  } catch (err) {
    throw {
      message: 'google search failed :(',
      code: 'GOOGLE_SEARCH_ERROR',
      originalError: err
    } as SearchError;
  }
}

export async function searchDuckDuckGo(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
  try {
    const opts = { ...defaultOptions, ...options };
    
    // search ddg
    const results = await duckSearch(query, {
      safeSearch: opts.safeSearch ? SafeSearchType.STRICT : SafeSearchType.OFF
    });

    return results.results
      .slice(0, opts.limit)
      .map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.description,
        source: 'duckduckgo' as const
      }));
  } catch (err) {
    throw {
      message: 'duckduckgo search failed :/',
      code: 'DDG_SEARCH_ERROR', 
      originalError: err
    } as SearchError;
  }
}

// unified search that tries ddg first, then google as fallback
export async function search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
  try {
    // try duckduckgo first
    return await searchDuckDuckGo(query, options);
  } catch (err) {
    // fallback to google if ddg fails
    console.warn('duckduckgo search failed, falling back to google...', err);
    return await searchGoogle(query, options);
  }
}