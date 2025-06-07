# News Module Documentation

The news module provides access to news articles from multiple sources:

- Multiple major news RSS feeds
- Google News RSS feed (no browser required)
- Google News web scraping (optional, requires browser)

## Installation

The module requires dependencies:

```bash
npm install rss-parser google-news-scraper puppeteer
```

### Important Note

Only the optional Google News scraping requires Puppeteer. The RSS feeds (including Google News RSS) work without any browser setup.

## Usage

### Basic Usage (RSS Feeds)

```typescript
import { searchNews } from "llm-kit";

// search across all RSS feeds (default)
const articles = await searchNews("artificial intelligence");

// search using Google News RSS (no browser needed)
const googleNews = await searchNews("tech news", {
  provider: "google-rss",
});

// use Google News scraping (requires browser)
const scrapedNews = await searchNews("tech news", {
  provider: "google",
  timeframe: "1d",
});
```

### With Options

```typescript
// search with custom timeout, retries and limit
const articles = await searchNews("tech news", {
  timeout: 5000, // 5 second timeout for RSS feeds
  maxRetries: 3, // retry failed feeds 3 times
  limit: 10, // only get 10 results
});

// use Google News RSS
const googleRss = await searchNews("tech news", {
  provider: "google-rss",
  limit: 10,
});

// use Google News scraping with timeframe
const googleScrape = await searchNews("tech news", {
  provider: "google",
  timeframe: "1d", // last 24 hours
  limit: 10,
});
```

## Return Type

The search functions return an array of NewsArticle objects:

```typescript
interface NewsArticle {
  title: string; // article title
  link: string; // url to full article
  source: string; // publication source
  time?: string; // human readable time
  datetime?: Date; // parsed datetime
  image?: string; // article image url if available
  description?: string; // article description/excerpt
  guid?: string; // unique identifier
}
```

## News Sources

### RSS Feeds (Default Provider)

Primary feeds (most reliable):

- Google News main feed
- CBS News (Technology, World)
- Wall Street Journal World
- NBC News
- BBC News
- New York Times
- HuffPost

### Google News RSS ('google-rss' provider)

- Access to Google News without browser
- Real-time news search
- Reliable and fast
- No setup required

### Google News Scraping ('google' provider)

- Full Google News features
- Custom timeframes
- Image coverage
- Requires browser setup

## Features

### RSS Provider (Default)

- Parallel fetching with retries
- Automatic deduplication
- Full text search
- Smart timeout handling (5s default)
- Multiple retry attempts
- Date-based sorting
- Proper User-Agent headers
- No browser requirements

### Google News RSS

- Simple setup (no browser needed)
- Fast and reliable
- Real-time news search
- Direct from Google News

### Google News Scraping

- Custom timeframe support
- Rich metadata
- Pretty URLs
- Requires browser setup

## Error Handling

```typescript
try {
  const articles = await searchNews("breaking news");
} catch (error) {
  if (error.code === "NEWS_SEARCH_ERROR") {
    console.error(error.message);
  }
}
```

## Performance and Reliability

### RSS & Google News RSS

- Parallel feed fetching with retries
- 5-second default timeout per feed
- 3 retry attempts with delays
- Fault tolerance (continues if feeds fail)
- Smart feed prioritization
- Proper User-Agent headers
- Memory-efficient deduplication
- No browser dependencies

### Google News Scraping

- Requires browser/Puppeteer setup
- Slower due to web scraping
- May need `--no-sandbox` flag on servers

## Environment Setup

### Basic Setup (RSS only)

```bash
npm install rss-parser
```

### Full Setup (including Google News scraping)

```bash
npm install rss-parser google-news-scraper puppeteer

# Configuration options
const options = {
  timeout: 10000,    // 10 second timeout
  maxRetries: 3,     // retry failed feeds 3 times
  limit: 20          // max results to return
};

# Server setup for Google News scraping (optional)
apt-get update && apt-get install -y \
  chromium-browser \
  libpuppeteer-extra
```

## Reliability Features

- Each feed has independent timeout and retry logic
- Failed feeds don't block other feeds
- Network errors are caught and logged
- Rate limiting between retries
- Falls back to available feeds if some fail
- Proper HTTP headers and user agent
- Smart feed ordering based on reliability
- Automatic deduplication of cross-feed stories
