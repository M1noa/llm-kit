# llm-search 🔍

> A Node.js module for searching and scraping web content, designed for LLMs but useful for everyone!

## Features

-  Search multiple engines (Google, DuckDuckGo)
-  Wikipedia & HackerNews Scrapeing
-  Website text extraction
- ⚡ **No API keys required**
-  Automatic fallbacks

## Installation

```bash
npm install llm-search
```

## Quick Start

```typescript
import { search, wikiSearch, getTopStories, getWebpageContent } from 'llm-search';

// Search the web
const results = await search('typescript tutorial');
console.log(results);

// Search Wikipedia
const wikiResults = await wikiSearch('Node.js');
console.log(wikiResults);

// Get HackerNews stories
const hnStories = await getTopStories(5);
console.log(hnStories);

// Extract webpage content
const content = await getWebpageContent('https://example.com');
console.log(content.textContent);
```

### JavaScript Usage
The module works seamlessly with JavaScript projects:

```javascript
const { search, wikiSearch, getTopStories, getWebpageContent } = require('llm-search');

// Use the same API as TypeScript
async function example() {
  const results = await search('nodejs tutorial');
  console.log(results);
}
```

## Full Example

Check out [src/test.ts](src/test.ts) for a complete example that demonstrates all features including:
- Web search with Google and DuckDuckGo
- Wikipedia search and content extraction
- HackerNews story fetching
- Webpage content extraction
- Error handling
- Response formats

## Documentation

See the [docs](./docs) directory for detailed documentation:

- [Search Module](./docs/search.md)
- [Wikipedia Module](./docs/wikipedia.md)
- [HackerNews Module](./docs/hackernews.md)
- [Webpage Module](./docs/webpage.md)

## Dependencies

This package wouldn't be possible without these awesome libraries:

- [wikipedia](https://www.npmjs.com/package/wikipedia) - Wikipedia API wrapper
- [@mozilla/readability](https://www.npmjs.com/package/@mozilla/readability) - Mozilla's Readability library
- [google-sr](https://www.npmjs.com/package/google-sr) - Google search scraping
- [duck-duck-scrape](https://www.npmjs.com/package/duck-duck-scrape) - DuckDuckGo scraping
- [node-hn-api](https://www.npmjs.com/package/node-hn-api) - HackerNews API wrapper

## License

MIT

## Contributing

Contributions welcome!!