# llm-kit Documentation

This documentation covers usage for both TypeScript and Node.js environments.

## Table of Contents

- [Installation](#installation)
- [TypeScript Usage](#typescript-usage)
- [Node.js Usage](#nodejs-usage)
- [Module Documentation](#module-documentation)

## Installation

```bash
npm install llm-kit
```

## TypeScript Usage

### Basic Search

```typescript
import { search, SearchResult } from "llm-kit";

async function searchExample() {
  try {
    const results: SearchResult[] = await search("typescript tutorial");
    console.log(results);
  } catch (error) {
    console.error("Search failed:", error);
  }
}
```

### Wikipedia Search and Content

```typescript
import { wikiSearch, wikiGetContent, WikipediaResult } from "llm-kit";

async function wikiExample() {
  try {
    const results: WikipediaResult[] = await wikiSearch("Node.js");
    const content = await wikiGetContent(results[0].title);
    console.log(content);
  } catch (error) {
    console.error("Wiki search failed:", error);
  }
}
```

### HackerNews Integration

```typescript
import {
  getTopStories,
  getNewStories,
  getStoryById,
  HackerNewsResult,
} from "llm-kit";

async function hnExample() {
  try {
    const topStories: HackerNewsResult[] = await getTopStories(5);
    const newStories: HackerNewsResult[] = await getNewStories(5);
    const story = await getStoryById(topStories[0].id);
    console.log({ topStories, newStories, story });
  } catch (error) {
    console.error("HN fetch failed:", error);
  }
}
```

### Webpage Content Extraction

```typescript
import { getWebpageContent, WebpageContent } from "llm-kit";

async function webpageExample() {
  try {
    const content: WebpageContent = await getWebpageContent(
      "https://example.com"
    );
    console.log({
      title: content.title,
      text: content.textContent,
      excerpt: content.excerpt,
    });
  } catch (error) {
    console.error("Content extraction failed:", error);
  }
}
```

## Node.js Usage

### Basic Search

```javascript
const { search } = require("llm-kit");

async function searchExample() {
  try {
    const results = await search("nodejs tutorial");
    console.log(results);
  } catch (error) {
    console.error("Search failed:", error);
  }
}
```

### Wikipedia Search and Content

```javascript
const { wikiSearch, wikiGetContent } = require("llm-kit");

async function wikiExample() {
  try {
    const results = await wikiSearch("Node.js");
    const content = await wikiGetContent(results[0].title);
    console.log(content);
  } catch (error) {
    console.error("Wiki search failed:", error);
  }
}
```

### HackerNews Integration

```javascript
const { getTopStories, getNewStories, getStoryById } = require("llm-kit");

async function hnExample() {
  try {
    const topStories = await getTopStories(5);
    const newStories = await getNewStories(5);
    const story = await getStoryById(topStories[0].id);
    console.log({ topStories, newStories, story });
  } catch (error) {
    console.error("HN fetch failed:", error);
  }
}
```

### Webpage Content Extraction

```javascript
const { getWebpageContent } = require("llm-kit");

async function webpageExample() {
  try {
    const content = await getWebpageContent("https://example.com");
    console.log({
      title: content.title,
      text: content.textContent,
      excerpt: content.excerpt,
    });
  } catch (error) {
    console.error("Content extraction failed:", error);
  }
}
```

## Module Documentation

For detailed documentation of each module, see:

- [Search Module](./search.md)
- [Wikipedia Module](./wikipedia.md)
- [HackerNews Module](./hackernews.md)
- [Webpage Module](./webpage.md)

## Error Handling

All functions throw a `SearchError` type with the following structure:

```typescript
interface SearchError {
  message: string; // Human-readable error message
  code: string; // Error code for programmatic handling
  originalError?: any; // Original error object if available
}
```

Example error handling:

```typescript
try {
  const results = await search("typescript");
} catch (error) {
  if (error.code === "GOOGLE_SEARCH_ERROR") {
    // Handle Google search error
  } else if (error.code === "DDG_SEARCH_ERROR") {
    // Handle DuckDuckGo error
  }
}
```

The same error handling works in JavaScript, just without the type annotations.
