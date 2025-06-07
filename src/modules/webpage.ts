// webpage.ts - extract readable content from webpages using readability n stuff

import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
const TurndownService = require("turndown");
import { WebpageContent, WebpageAsset, SearchError } from "../types";
import { wikiGetContent } from "./wikipedia";
import { getStoryById } from "./hackernews";
import { processHtml } from "../utils/htmlcleaner";
import { getPostFromUrl } from "./reddit";

// initialize turndown for markdown conversion
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

// extract assets (images, links, etc)
function extractAssets(document: Document, baseUrl: string): WebpageAsset[] {
  const assets: WebpageAsset[] = [];

  // get images
  document.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src");
    if (src) {
      try {
        assets.push({
          url: new URL(src, baseUrl).toString(),
          type: "image",
          alt: img.getAttribute("alt") || undefined,
        });
      } catch {
        // Skip invalid URLs
      }
    }
  });

  // get downloadable links (pdf, zip, etc)
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (href && /\.(pdf|zip|doc|docx|xls|xlsx|csv)$/i.test(href)) {
      try {
        assets.push({
          url: new URL(href, baseUrl).toString(),
          type: "link",
          alt: a.textContent || undefined,
        });
      } catch {
        // Skip invalid URLs
      }
    }
  });

  return assets;
}

// clean up text by removing excessive whitespace and making it more readable
function cleanText(text: string): string {
  return text
    .replace(/[\n\s\r]+/g, " ")
    .replace(/([.!?])\s+/g, "$1\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+/g, " ")
    .trim();
}

// check url type and get appropriate handler
function getUrlType(
  url: string
): "wikipedia" | "hackernews" | "reddit" | "general" | "unsupported" {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (hostname.includes("wikipedia.org")) {
      return "wikipedia";
    }

    if (hostname === "news.ycombinator.com" && url.includes("item?id=")) {
      return "hackernews";
    }

    // check for reddit urls
    if (hostname === "reddit.com" || hostname === "www.reddit.com") {
      // only handle specific post urls, not subreddit listings etc
      if (url.match(/\/r\/[^/]+\/comments\/[^/]+\//)) {
        return "reddit";
      }
    }

    // list of domains that don't work well with readability
    const unsupported = [
      "youtube.com",
      "youtu.be",
      "vimeo.com",
      "twitter.com",
      "x.com",
      "instagram.com",
      "facebook.com",
      "linkedin.com",
    ];

    if (unsupported.some((domain) => hostname.includes(domain))) {
      return "unsupported";
    }

    return "general";
  } catch {
    return "unsupported";
  }
}

// get webpage content using readability
export async function getWebpageContent(url: string): Promise<WebpageContent> {
  try {
    const urlType = getUrlType(url);

    // handle special cases
    if (urlType === "wikipedia") {
      const title = url.split("/wiki/")[1]?.replace(/_/g, " ") || url;
      const content = await wikiGetContent(title);
      return {
        title,
        content,
        textContent: cleanText(content),
        length: content.length,
        excerpt: content.slice(0, 200) + "...",
        siteName: "Wikipedia",
      };
    }

    if (urlType === "hackernews") {
      const id = parseInt(url.split("id=")[1]);
      const story = await getStoryById(id);
      const content = story.snippet || story.title || "No content available";
      const cleanedContent = cleanText(content);
      return {
        title: story.title || url,
        content: content,
        textContent: cleanedContent,
        length: cleanedContent.length,
        excerpt:
          cleanedContent.slice(0, 200) +
          (cleanedContent.length > 200 ? "..." : ""),
        siteName: "Hacker News",
      };
    }

    if (urlType === "reddit") {
      const post = await getPostFromUrl(url);
      const content = post.selftext || post.title || "No content available";
      const cleanedContent = cleanText(content);
      return {
        title: post.title || url,
        content: content,
        textContent: cleanedContent,
        length: cleanedContent.length,
        excerpt:
          cleanedContent.slice(0, 200) +
          (cleanedContent.length > 200 ? "..." : ""),
        siteName: `r/${post.subreddit}`,
        metadata: {
          author: post.author,
          score: post.score,
          numComments: post.num_comments,
          createdAt: new Date(post.created_utc * 1000).toISOString(),
        },
      };
    }

    if (urlType === "unsupported") {
      return {
        title: url,
        content: "",
        textContent: "This URL type is not supported for content extraction.",
        length: 0,
        excerpt: "Content not available - URL type not supported",
      };
    }

    // handle general case
    // fetch the webpage content with timeout and retries
    const maxRetries = 3;
    const timeout = 15000; // 15 seconds

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Add random delay between 1-3 seconds
        const delay = Math.floor(Math.random() * 2000) + 1000;
        if (attempt > 0) {
          console.log(`\nRetry attempt ${attempt + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, delay + (1000 * attempt))); // random + exponential backoff
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        console.log(`\nFetching webpage: ${url}`);
        console.log(`Attempt ${attempt + 1}/${maxRetries}`);
        console.log(`Timeout: ${timeout}ms`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log("❌ Request timed out after", timeout, "ms");
        }, timeout);

        console.log("Sending request with headers:");
        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'max-age=0',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Connection': 'keep-alive',
          'DNT': '1'
        };
        console.log(JSON.stringify(headers, null, 2));

        const response = await fetch(url, {
          redirect: "follow",
          signal: controller.signal,
          headers,
          credentials: 'include',
          referrerPolicy: 'no-referrer-when-downgrade',
          mode: 'cors'
        });

        clearTimeout(timeoutId);

        console.log("Response status:", response.status);
        console.log("Content-Type:", response.headers.get('content-type'));
        
        if (!response.ok) {
          console.log("❌ HTTP error!");
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("✅ Response received successfully");
        console.log("Getting response text...");
        const html = await response.text();
        console.log(`Got ${html.length} bytes of HTML`);
        
        const finalUrl = response.url; // get final URL after any redirects
        console.log("Final URL after redirects:", finalUrl);

        // create dom with final url for proper path resolution
        const dom = new JSDOM(html, { url: finalUrl });
        const document = dom.window.document;

        // extract favicon
        let faviconUrl = `${new URL(finalUrl).origin}/favicon.ico`;
        const faviconLink = document.querySelector("link[rel*='icon']");
        if (faviconLink?.getAttribute("href")) {
          faviconUrl = new URL(
            faviconLink.getAttribute("href")!,
            finalUrl
          ).toString();
        }

        // process html
        console.log("Processing HTML...");
        const processedHtml = processHtml(
          document.documentElement.outerHTML,
          finalUrl
        );

        // update document with processed html
        document.documentElement.innerHTML = processedHtml;
        console.log("✅ HTML processed successfully");

        // extract assets
        console.log("Extracting assets...");
        const assets = extractAssets(document, finalUrl);
        console.log(`Found ${assets.length} assets`);

        // get readable content
        console.log("Parsing content with Readability...");
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article) {
          console.log("❌ Readability parsing failed");
          return {
            title: finalUrl,
            content: "",
            textContent: "Failed to extract readable content from this page.",
            length: 0,
            excerpt: "Content extraction failed",
          };
        }

        console.log("✅ Content parsed successfully");
        const cleanedText = cleanText(article.textContent || "");

        // convert to markdown
        console.log("Converting to markdown...");
        const markdown = turndownService.turndown(processedHtml);
        console.log("✅ Conversion complete");

        return {
          title: article.title || document.title || finalUrl,
          content: article.content || "",
          textContent: cleanedText,
          length: cleanedText.length,
          excerpt: article.excerpt || undefined,
          siteName: article.siteName || undefined,
          faviconUrl,
          processedHtml,
          assets,
          markdown,
        };

      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error; // Re-throw on last attempt
        }
        console.warn(`❌ Attempt ${attempt + 1} failed:`, error);
        // Continue to next attempt
      }
    }

    // This shouldn't be reached due to the throw in the last catch block
    throw new Error("All fetch attempts failed");

  } catch (err) {
    throw {
      message: "failed to get webpage content :/",
      code: "WEBPAGE_ERROR",
      originalError: err,
    } as SearchError;
  }
}

// get just the text content
export async function getWebpageText(url: string): Promise<string> {
  const content = await getWebpageContent(url);
  return content.textContent;
}

// check if url is accessible
export async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    if (!isValidUrl(url)) {
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; llm-kit/1.0; +https://github.com/M1noa/llm-kit)',
        'Accept': '*/*'
      }
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`URL accessibility check failed for ${url}:`, error);
    return false;
  }
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
