// types.ts - all our shared types n stuff

export interface SearchOptions {
  limit?: number;
  safeSearch?: boolean;
  timeout?: number;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  source: 'google' | 'duckduckgo' | 'wikipedia' | 'hackernews';
}

export interface WikipediaResult extends SearchResult {
  extract?: string;
  thumbnail?: string;
}

export interface HackerNewsResult extends SearchResult {
  points?: number;
  author?: string;
  comments?: number;
  time?: Date;
}

export interface WebpageContent {
  title?: string;
  content: string;
  textContent: string;
  length: number;
  excerpt?: string;
  siteName?: string;
}

export interface SearchError {
  message: string;
  code: string;
  originalError?: any;
}