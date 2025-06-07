# Search Module 🔍

The search module provides unified search capabilities using Google, Brave, DuckDuckGo, and Ecosia search engines.

## Functions

### search(query: string, options?: SearchOptions)

Main search function that supports multiple search providers.

```typescript
import { search } from "llm-kit";

// Using Google (default)
const googleResults = await search("typescript tutorial", {
  limit: 5,
  safeSearch: true,
  timeout: 5000,
});

// Using Brave
const braveResults = await search("typescript tutorial", {
  provider: "brave",
  limit: 5,
  safeSearch: true,
});

// Using DuckDuckGo
const ddgResults = await search("typescript tutorial", {
  provider: "duckduckgo",
  limit: 5,
  safeSearch: true,
});

// Using Ecosia
const ecosiaResults = await search("typescript tutorial", {
  provider: "ecosia",
  limit: 5,
});
```

## Options

```typescript
interface SearchOptions {
  provider?: "google" | "brave" | "duckduckgo" | "ecosia"; // search provider (default: 'google')
  limit?: number; // max number of results (default: 10)
  safeSearch?: boolean; // enable safe search (default: true)
  timeout?: number; // request timeout in ms (default: 10000)
}
```

## Result Format

```typescript
interface SearchResult {
  title: string; // result title
  url: string; // result url
  snippet?: string; // result description/snippet
  source: "google" | "brave" | "duckduckgo" | "ecosia"; // which provider returned this result
}
```

## Error Handling

All functions throw a `SearchError` on failure:

```typescript
try {
  const results = await search("typescript tutorial", { provider: "ecosia" });
} catch (err) {
  if (err.code === "ECOSIA_SEARCH_ERROR") {
    console.log("Ecosia search failed, try another provider...");
  }
}
```

## Tips

- Google is the default provider and generally has more comprehensive results
- Brave search provides good privacy-focused results
- DuckDuckGo also focuses on privacy and has integrated instant answers
- Ecosia is an eco-friendly search engine that plants trees with search revenue
- Use safeSearch option to filter NSFW content (enabled by default)
- Set appropriate timeout for your use case (default 10s)
- Results are cached for 1 hour to reduce API calls

## Specialized URLs

When searching specialized content, consider using dedicated modules instead:

- For Wikipedia articles: Use the wikipedia module
- For Hacker News content: Use the hackernews module
