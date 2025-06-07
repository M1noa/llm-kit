# Webpage Module

This module provides functionality to extract and process content from web pages, including text extraction, HTML processing, and asset discovery.

## Installation

```bash
# Install core dependencies
npm install @mozilla/readability jsdom puppeteer turndown
```

## Features

- Extract readable content using Mozilla's Readability
- Clean HTML processing (remove scripts, styles, etc.)
- Convert relative URLs to absolute
- Extract asset URLs (images, downloadable files)
- Convert HTML to Markdown
- Detect and extract favicons
- Support for special sites (Wikipedia, Hacker News)
- Automatic redirect handling

## Usage

```typescript
import { getWebpageContent, getWebpageText, isUrlAccessible } from "llm-kit";

// Get full webpage content including processed HTML and assets
const content = await getWebpageContent("https://example.com");
console.log(content.title); // page title
console.log(content.textContent); // clean text content
console.log(content.markdown); // markdown version
console.log(content.assets); // list of assets
console.log(content.faviconUrl); // favicon URL

// Get just the readable text content
const text = await getWebpageText("https://example.com");

// Check if URL is accessible
const isAccessible = await isUrlAccessible("https://example.com");
```

## Return Types

The module returns a `WebpageContent` object with the following structure:

```typescript
interface WebpageContent {
  title: string; // page title
  content: string; // raw HTML content
  textContent: string; // clean text content
  length: number; // content length
  excerpt?: string; // short excerpt
  siteName?: string; // site name if available
  faviconUrl?: string; // absolute URL of favicon
  processedHtml?: string; // cleaned HTML with absolute URLs
  assets?: WebpageAsset[]; // list of asset URLs
  markdown?: string; // HTML converted to Markdown
}

interface WebpageAsset {
  url: string; // absolute URL of asset
  type: "image" | "link" | "other";
  alt?: string; // alt text for images
}
```

## HTML Processing

The module performs several cleanup operations on HTML:

- Removes scripts, styles, and other non-content elements
- Removes HTML comments
- Converts relative URLs to absolute
- Preserves important content elements (text, headings, images, links)
- Removes JavaScript event handlers
- Removes unnecessary attributes while preserving essential ones
- Properly handles malformed HTML

## Asset Discovery

Extracts URLs for:

- Images (`<img>` tags)
- Downloadable files (PDFs, DOCs, etc.)
- Links to supported file types

## Special Site Handling

### Wikipedia Pages

- Extracts clean article content
- Preserves article structure
- Includes site metadata

### Hacker News

- Extracts story content and comments
- Preserves story metadata
- Handles special HN formatting

## Dynamic Content

For sites that require JavaScript:

```typescript
// Use Puppeteer for dynamic content
const content = await getWebpageContent("https://example.com", true);
```

## Error Handling

```typescript
try {
  const content = await getWebpageContent("https://example.com");
} catch (error) {
  if (error.code === "WEBPAGE_ERROR") {
    console.error("Failed to get content:", error.message);
  }
}
```

## URL and Redirect Handling

The module handles various URL scenarios:

- Automatically follows HTTP redirects (301, 302, etc.)
- Updates base URL for relative paths after redirects
- Preserves URL parameters and fragments
- Handles both HTTP and meta refresh redirects in Puppeteer mode
- Provides final URL after redirects in results

Example redirect handling:

```typescript
// Short URL that redirects
const content = await getWebpageContent("http://bit.ly/example");
console.log(content.faviconUrl); // Uses final URL after redirect

// Meta refresh redirects (requires Puppeteer)
const content = await getWebpageContent("http://old-site.com", true);
```

## Notes

- Some sites may block automated access
- Dynamic content may require Puppeteer mode
- Large pages may take longer to process
- Some sites (YouTube, Twitter, etc.) are not supported due to their structure
- Redirects are handled automatically in both normal and Puppeteer mode
- All asset URLs are made absolute based on final URL after redirects
- Redirects are automatically followed to final destination
- The final URL after redirects is used for all processing
- Both HTTP and meta redirects are handled when using Puppeteer mode

## URL Handling

The module automatically handles various URL scenarios:

```typescript
// Handles redirects automatically
const content = await getWebpageContent("http://t.co/shortlink");

// Updates relative paths based on final URL after redirects
const content = await getWebpageContent("http://example.com/redirect-page");

// Works with both HTTP and meta refreshes
const content = await getWebpageContent("http://old-site.com", true); // use Puppeteer for meta refreshes
```
