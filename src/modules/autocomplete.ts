// autocomplete.ts - search suggestions from various providers... they better work

import fetch from 'node-fetch';
import { SearchError } from '../types';

// all the providers we support
export type AutocompleteProvider = 
  | 'duckduckgo'  // default, simple json response
  | 'google'      // array response with extra metadata
  | 'brave'       // rich results with entities
  | 'yahoo'       // detailed results with metadata
  | 'ecosia'      // simple json response
  | 'qwant'       // simple json with types
  | 'swisscows'   // simple array response
  | 'yandex';     // google-like response

export interface AutocompleteSuggestion {
  phrase: string;         // the actual suggestion
  score?: number;         // relevance score if available 
  metadata?: {           // optional extra data some providers return
    type?: string;       // entity type/category
    description?: string; // description if available
    imageUrl?: string;   // image url if available
    url?: string;        // related url if available
  };
}

export interface AutocompleteOptions {
  provider?: AutocompleteProvider;
  limit?: number;        // max number of results
}

// parse google's weird array response
function parseGoogleResponse(data: any): AutocompleteSuggestion[] {
  try {
    const [query, suggestions] = data;
    return suggestions.map((s: string) => ({
      phrase: s
    }));
  } catch {
    return [];
  }
}

// parse ddg's nice json response
function parseDuckDuckGoResponse(data: any): AutocompleteSuggestion[] {
  try {
    return data.map((item: any) => ({
      phrase: item.phrase
    }));
  } catch {
    return [];
  }
}

// parse yahoo's detailed response
function parseYahooResponse(data: any): AutocompleteSuggestion[] {
  try {
    return data.r.map((item: any) => {
      const suggestion: AutocompleteSuggestion = {
        phrase: item.k
      };

      // add metadata if available
      if (item.fd) {
        suggestion.metadata = {
          type: item.d?.subdn,
          description: item.fd.short_desc,
          imageUrl: item.fd.imageUrl,
          url: item.fd.URL?.[0]
        };
      }

      return suggestion;
    });
  } catch {
    return [];
  }
}

// parse brave's rich results
function parseBraveResponse(data: any): AutocompleteSuggestion[] {
  try {
    const [query, suggestions] = data;
    return suggestions.map((s: any) => ({
      phrase: s.q,
      metadata: s.is_entity ? {
        type: s.category || 'entity',
        description: s.desc,
        imageUrl: s.img
      } : undefined
    }));
  } catch {
    return [];
  }
}

// parse ecosia's simple response
function parseEcosiaResponse(data: any): AutocompleteSuggestion[] {
  try {
    return data.suggestions.map((s: string) => ({
      phrase: s
    }));
  } catch {
    return [];
  }
}

// parse qwant's typed response
function parseQwantResponse(data: any): AutocompleteSuggestion[] {
  try {
    return data.data.items.map((item: any) => ({
      phrase: item.value,
      score: item.suggestType
    }));
  } catch {
    return [];
  }
}

// parse swisscows' array response
function parseSwisscowsResponse(data: any): AutocompleteSuggestion[] {
  try {
    return data.map((s: string) => ({
      phrase: s
    }));
  } catch {
    return [];
  }
}

// get the url for a provider
function getProviderUrl(query: string, provider: AutocompleteProvider): string {
  const encodedQuery = encodeURIComponent(query);
  
  switch (provider) {
    case 'google':
      return `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodedQuery}`;
    case 'duckduckgo':
      return `https://duckduckgo.com/ac/?kl=wt-wt&q=${encodedQuery}`;
    case 'yahoo':
      return `https://search.yahoo.com/sugg/gossip/gossip-us-fastbreak?output=sd1&command=${encodedQuery}`;
    case 'brave':
      return `https://search.brave.com/api/suggest?rich=true&source=web&country=us&q=${encodedQuery}`;
    case 'yandex':
      return `https://yandex.com/suggest/suggest-ya.cgi?srv=morda_com_desktop&wiz=TrWth&uil=en&fact=1&v=4&icon=1&part=${encodedQuery}`;
    case 'ecosia':
      return `https://ac.ecosia.org/?q=${encodedQuery}`;
    case 'qwant':
      return `https://api.qwant.com/v3/suggest?q=${encodedQuery}`;
    case 'swisscows':
      return `https://api.swisscows.com/suggest?locale=en-US&itemsCount=20&query=${encodedQuery}`;
  }
}

// parse response based on provider
function parseResponse(data: any, provider: AutocompleteProvider): AutocompleteSuggestion[] {
  switch (provider) {
    case 'google':
    case 'yandex':
      return parseGoogleResponse(data);
    case 'duckduckgo':
      return parseDuckDuckGoResponse(data); 
    case 'yahoo':
      return parseYahooResponse(data);
    case 'brave':
      return parseBraveResponse(data);
    case 'ecosia':
      return parseEcosiaResponse(data);
    case 'qwant':
      return parseQwantResponse(data);
    case 'swisscows':
      return parseSwisscowsResponse(data);
    default:
      return [];
  }
}

// get autocomplete suggestions
export async function getAutocompleteSuggestions(
  query: string,
  options: AutocompleteOptions = {}
): Promise<AutocompleteSuggestion[]> {
  const provider = options.provider || 'duckduckgo';
  
  try {
    // get the url for this provider
    const url = getProviderUrl(query, provider);
    
    // make the request
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`provider ${provider} returned status ${response.status}`);
    }
    
    // parse the response
    const data = await response.json();
    let suggestions = parseResponse(data, provider);
    
    // apply limit if specified
    if (options.limit) {
      suggestions = suggestions.slice(0, options.limit);
    }
    
    return suggestions;
  } catch (error) {
    throw {
      message: `Failed to get autocomplete suggestions: ${error}`,
      code: 'AUTOCOMPLETE_ERROR',
      originalError: error,
    } as SearchError;
  }
}