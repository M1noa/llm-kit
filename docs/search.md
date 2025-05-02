# Search Module 🔍

The search module provides unified search capabilities using both Google and DuckDuckGo.

## Functions

### search(query: string, options?: SearchOptions)

Main search function that tries Google first, falls back to DuckDuckGo if Google fails.

```typescript
import { search } from 'llm-search';

const results = await search('typescript tutorial', {
  limit: 5,
  safeSearch: true,
  timeout: 5000
});
```

### searchGoogle(query: string, options?: SearchOptions)

Search using Google specifically.

```typescript
import { searchGoogle } from 'llm-search';

const results = await searchGoogle('typescript tutorial');
```

### searchDuckDuckGo(query: string, options?: SearchOptions)

Search using DuckDuckGo specifically.

```typescript
import { searchDuckDuckGo } from 'llm-search';

const results = await searchDuckDuckGo('typescript tutorial');
```

## Options

```typescript
interface SearchOptions {
  limit?: number;      // max number of results (default: 10)
  safeSearch?: boolean; // enable safe search (default: true)
  timeout?: number;    // request timeout in ms (default: 10000)
}
```

## Result Format

```typescript
interface SearchResult {
  title: string;       // result title
  url: string;        // result url
  snippet?: string;   // result description/snippet
  source: 'google' | 'duckduckgo' | 'wikipedia' | 'hackernews';
}
```

## Error Handling

All functions throw a `SearchError` on failure:

```typescript
try {
  const results = await search('typescript tutorial');
} catch (err) {
  if (err.code === 'GOOGLE_SEARCH_ERROR') {
    console.log('google search failed, falling back to duckduckgo...');
  }
}
```

## Tips

- For best results, use the main `search()` function which handles fallbacks automatically
- DuckDuckGo is more reliable but might have fewer results
- Use safeSearch option to filter NSFW content
- Set appropriate timeout for your use case (default 10s)