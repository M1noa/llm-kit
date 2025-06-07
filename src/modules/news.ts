// news.ts - get news from RSS feeds including Google News RSS
const RSS = require("rss-parser");
const googleNewsScraper = require("google-news-scraper");
import { SearchError } from "../types";

// for encoding search queries in URLs
function encodeQuery(query: string): string {
  return encodeURIComponent(query).replace(/%20/g, "+");
}

// news provider type
export type NewsProvider = "rss" | "google" | "google-rss";

// RSS feed list - most reliable feeds first
const RSS_FEEDS = [
  "https://news.google.com/news/rss", // Google News main feed
  "https://www.cbsnews.com/latest/rss/technology", // CBS Tech
  "https://www.cbsnews.com/latest/rss/world", // CBS World
  "https://feeds.a.dj.com/rss/RSSWorldNews.xml", // WSJ World
  "https://feeds.nbcnews.com/nbcnews/public/news", // NBC News
  "https://feeds.bbci.co.uk/news/rss.xml", // BBC News
  "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", // NYT
  "https://www.huffpost.com/section/front-page/feed", // HuffPost
];

// news article interface
export interface NewsArticle {
  title: string;
  link: string;
  source: string;
  time?: string;
  datetime?: Date;
  image?: string;
  description?: string;
  guid?: string; // for deduplication
}

// news search options
export interface NewsSearchOptions {
  provider?: NewsProvider;
  timeframe?: string; // google: 1h, 7d, 1y etc
  limit?: number; // max results to return
  timeout?: number; // timeout for RSS feeds in ms
  maxRetries?: number; // max retries for failed feeds
}

// normalize google news article
function normalizeGoogleArticle(article: any): NewsArticle {
  return {
    title: article.title,
    link: article.link,
    source: article.source,
    time: article.time,
    datetime: article.datetime,
    image: article.image,
  };
}

// normalize RSS article
function normalizeRSSArticle(article: any, source: string): NewsArticle {
  return {
    title: article.title,
    link: article.link,
    source: source,
    description: article.contentSnippet || article.content,
    datetime: article.isoDate ? new Date(article.isoDate) : undefined,
    time: article.pubDate,
    guid: article.guid || article.id || article.link,
    image: article.enclosure?.url,
  };
}

// fetch single RSS feed with retries
async function fetchFeed(
  parser: any,
  url: string,
  timeout: number,
  maxRetries: number
): Promise<NewsArticle[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // add small delay between retries
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // fetch with timeout
      const feed = (await Promise.race([
        parser.parseURL(url),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), timeout);
        }),
      ])) as any;

      // normalize articles
      return feed.items.map((item) =>
        normalizeRSSArticle(item, feed.title || "Unknown")
      );
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `Feed fetch attempt ${attempt + 1} failed for ${url}:`,
        error
      );
    }
  }

  console.warn(`All ${maxRetries} attempts failed for ${url}:`, lastError);
  return [];
}

// deduplicate articles
function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const key = article.guid || article.link;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// sort articles by date
function sortArticles(articles: NewsArticle[]): NewsArticle[] {
  return articles.sort((a, b) => {
    const dateA = a.datetime?.getTime() || 0;
    const dateB = b.datetime?.getTime() || 0;
    return dateB - dateA; // newest first
  });
}

// search articles for query terms
function searchArticles(articles: NewsArticle[], query: string): NewsArticle[] {
  const terms = query.toLowerCase().split(" ");
  return articles.filter((article) => {
    const text = `${article.title} ${article.description || ""} ${
      article.source
    }`.toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

// main search function
export async function searchNews(
  query: string,
  options: NewsSearchOptions = {}
): Promise<NewsArticle[]> {
  const provider = options.provider || "rss";
  const limit = options.limit || 20;
  const timeout = options.timeout || 5000; // increased default timeout
  const maxRetries = options.maxRetries || 3;

  const parser = new RSS({
    timeout: timeout,
    customFields: {
      item: ["image", "enclosure"],
    },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; llm-kit/1.0; +https://github.com/M1noa/llm-kit)",
    },
  });

  try {
    if (provider === "google") {
      // use google news scraper
      const articles = await googleNewsScraper({
        searchTerm: query,
        prettyURLs: true,
        timeframe: options.timeframe || "7d",
        limit: limit,
      });
      return articles.map(normalizeGoogleArticle);
    } else if (provider === "google-rss") {
      // use Google News RSS feed
      const searchUrl = `https://news.google.com/rss/search?q=${encodeQuery(
        query
      )}&hl=en-US&gl=US&ceid=US:en`;

      const results = await fetchFeed(parser, searchUrl, timeout, maxRetries);
      return results.slice(0, limit);
    } else {
      // fetch all RSS feeds in parallel
      const feedPromises = RSS_FEEDS.map((url) =>
        fetchFeed(parser, url, timeout, maxRetries)
      );

      // wait for all feeds to complete or timeout
      const results = await Promise.all(feedPromises);
      const allArticles = results.flat();

      // process articles
      const filtered = searchArticles(allArticles, query);
      const deduped = deduplicateArticles(filtered);
      const sorted = sortArticles(deduped);

      return sorted.slice(0, limit);
    }
  } catch (error) {
    throw {
      message: `Failed to search news: ${
        error instanceof Error ? error.message : String(error)
      }`,
      code: "NEWS_SEARCH_ERROR",
      originalError: error,
    } as SearchError;
  }
}
