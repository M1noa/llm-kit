// webpage.ts - extract readable content from webpages using readability n stuff

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import puppeteer from 'puppeteer';
import { WebpageContent, SearchError } from '../types';
import { wikiGetContent } from './wikipedia';
import { getStoryById } from './hackernews';

// clean up text by removing excessive whitespace and making it more readable
function cleanText(text: string): string {
  return text
    .replace(/[\n\s\r]+/g, ' ')
    .replace(/([.!?])\s+/g, '$1\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
}

// check url type and get appropriate handler
function getUrlType(url: string): 'wikipedia' | 'hackernews' | 'general' | 'unsupported' {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (hostname.includes('wikipedia.org')) {
      return 'wikipedia';
    }
    
    if (hostname === 'news.ycombinator.com' && url.includes('item?id=')) {
      return 'hackernews';
    }

    // list of domains that don't work well with readability
    const unsupported = [
      'youtube.com', 'youtu.be', 'vimeo.com', 
      'twitter.com', 'x.com', 'instagram.com', 
      'facebook.com', 'linkedin.com'
    ];

    if (unsupported.some(domain => hostname.includes(domain))) {
      return 'unsupported';
    }

    return 'general';
  } catch {
    return 'unsupported';
  }
}

// get webpage content using readability
export async function getWebpageContent(url: string, usePuppeteer: boolean = false): Promise<WebpageContent> {
  try {
    const urlType = getUrlType(url);

    // handle special cases
    if (urlType === 'wikipedia') {
      const title = url.split('/wiki/')[1]?.replace(/_/g, ' ') || url;
      const content = await wikiGetContent(title);
      return {
        title,
        content,
        textContent: cleanText(content),
        length: content.length,
        excerpt: content.slice(0, 200) + '...',
        siteName: 'Wikipedia'
      };
    }

    if (urlType === 'hackernews') {
      const id = parseInt(url.split('id=')[1]);
      const story = await getStoryById(id);
      const content = story.snippet || story.title || 'No content available';
      const cleanedContent = cleanText(content);
      return {
        title: story.title || url,
        content: content,
        textContent: cleanedContent,
        length: cleanedContent.length,
        excerpt: cleanedContent.slice(0, 200) + (cleanedContent.length > 200 ? '...' : ''),
        siteName: 'Hacker News'
      };
    }

    if (urlType === 'unsupported') {
      return {
        title: url,
        content: '',
        textContent: 'This URL type is not supported for content extraction.',
        length: 0,
        excerpt: 'Content not available - URL type not supported'
      };
    }

    // handle general case with readability
    let html: string;

    if (usePuppeteer) {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0' });
      html = await page.content();
      await browser.close();
    } else {
      const response = await fetch(url);
      html = await response.text();
    }

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return {
        title: url,
        content: '',
        textContent: 'Failed to extract readable content from this page.',
        length: 0,
        excerpt: 'Content extraction failed'
      };
    }

    const cleanedText = cleanText(article.textContent || '');

    return {
      title: article.title || url,
      content: article.content || '',
      textContent: cleanedText,
      length: cleanedText.length,
      excerpt: article.excerpt || undefined,
      siteName: article.siteName || undefined
    };

  } catch (err) {
    throw {
      message: 'failed to get webpage content :/',
      code: 'WEBPAGE_ERROR',
      originalError: err
    } as SearchError;
  }
}

// get just the text content
export async function getWebpageText(url: string, usePuppeteer: boolean = false): Promise<string> {
  const content = await getWebpageContent(url, usePuppeteer);
  return content.textContent;
}

// check if url is accessible
export async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}