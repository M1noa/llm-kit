# Webpage Module 📄

Extract clean, readable content from any webpage using Mozilla's Readability library.

## Functions

### getWebpageContent(url: string, usePuppeteer?: boolean)

Extract readable content from a webpage.

```typescript
import { getWebpageContent } from 'llm-search';

// For static websites
const content = await getWebpageContent('https://example.com');

// For JavaScript-heavy sites
const content = await getWebpageContent('https://example.com', true);
```

### getWebpageText(url: string, usePuppeteer?: boolean)

Get just the text content of a webpage.

```typescript
import { getWebpageText } from 'llm-search';

const text = await getWebpageText('https://example.com');
```

### isUrlAccessible(url: string)

Check if a URL is accessible.

```typescript
import { isUrlAccessible } from 'llm-search';

const isAccessible = await isUrlAccessible('https://example.com');
```

## Result Format

```typescript
interface WebpageContent {
  title?: string;      // page title
  content: string;     // HTML content
  textContent: string; // plain text content
  length: number;      // content length
  excerpt?: string;    // short excerpt
  siteName?: string;   // website name
}
```

## Error Handling

All functions throw a `SearchError` on failure:

```typescript
try {
  const content = await getWebpageContent('https://example.com');
} catch (err) {
  if (err.code === 'WEBPAGE_ERROR') {
    console.error('failed to get content:', err.message);
  }
}
```

## Tips

### When to Use Puppeteer

Set `usePuppeteer: true` when:
- Site requires JavaScript to load content
- Content is dynamically loaded
- Site uses client-side rendering
- You need to wait for all resources to load

Example:
```typescript
// For React/Vue/Angular apps
const content = await getWebpageContent('https://spa-site.com', true);
```

### Content Cleaning

The module automatically:
- Removes ads and clutter
- Preserves important images
- Extracts main article content
- Maintains basic formatting
- Cleans up navigation/footers

### Performance

- Use `getWebpageText()` if you only need text
- Avoid Puppeteer for static sites
- Check URL accessibility first
- Consider caching results

### Limitations

- Some sites may block scraping
- Complex layouts might not parse perfectly
- JavaScript-heavy sites need Puppeteer
- Dynamic content might be missed
- Some paywalls can't be bypassed

## Examples

### Get Article Content
```typescript
const article = await getWebpageContent('https://blog.example.com/post');
console.log(article.title);
console.log(article.excerpt);
console.log(article.textContent);
```

### Check and Get Content
```typescript
if (await isUrlAccessible(url)) {
  const content = await getWebpageContent(url);
  // process content
}
```

### Handle Dynamic Sites
```typescript
const content = await getWebpageContent(url, {
  usePuppeteer: true
});