// reddit.ts - handles reddit stuff like getting posts n searching

import { SearchError } from '../types';

interface RedditPost {
  title: string;
  id: string;
  url: string;
  permalink: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  selftext?: string;
  subreddit: string;
  is_self: boolean;
}

// Get hot posts from a subreddit
export async function getSubredditHot(subreddit: string, limit = 25): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.children.map((post: any) => ({
      title: post.data.title,
      id: post.data.id,
      url: post.data.url,
      permalink: `https://reddit.com${post.data.permalink}`,
      author: post.data.author,
      score: post.data.score,
      num_comments: post.data.num_comments,
      created_utc: post.data.created_utc,
      selftext: post.data.selftext,
      subreddit: post.data.subreddit,
      is_self: post.data.is_self
    }));
  } catch (error) {
    throw {
      message: `failed to get subreddit posts: ${error instanceof Error ? error.message : String(error)}`,
      code: 'REDDIT_ERROR',
      originalError: error
    } as SearchError;
  }
}

// Search Reddit posts
export async function searchReddit(query: string, options: {
  sort?: 'hot' | 'new' | 'top' | 'relevance',
  limit?: number,
  type?: 'posts' | 'comments'
} = {}): Promise<RedditPost[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      sort: options.sort || 'hot',
      type: options.type || 'posts',
      limit: String(options.limit || 25)
    });

    const url = `https://www.reddit.com/search.json?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.children.map((post: any) => ({
      title: post.data.title,
      id: post.data.id,
      url: post.data.url,
      permalink: `https://reddit.com${post.data.permalink}`,
      author: post.data.author,
      score: post.data.score,
      num_comments: post.data.num_comments,
      created_utc: post.data.created_utc,
      selftext: post.data.selftext,
      subreddit: post.data.subreddit,
      is_self: post.data.is_self
    }));
  } catch (error) {
    throw {
      message: `reddit search failed: ${error instanceof Error ? error.message : String(error)}`,
      code: 'REDDIT_SEARCH_ERROR',
      originalError: error
    } as SearchError;
  }
}

// Get post info by URL
export async function getPostFromUrl(url: string): Promise<RedditPost> {
  try {
    // Convert post URL to .json URL
    const jsonUrl = url.replace(/\/?$/, '.json');
    const response = await fetch(jsonUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const post = data[0].data.children[0].data;

    return {
      title: post.title,
      id: post.id,
      url: post.url,
      permalink: `https://reddit.com${post.permalink}`,
      author: post.author,
      score: post.score,
      num_comments: post.num_comments,
      created_utc: post.created_utc,
      selftext: post.selftext,
      subreddit: post.subreddit,
      is_self: post.is_self
    };
  } catch (error) {
    throw {
      message: `failed to get reddit post: ${error instanceof Error ? error.message : String(error)}`,
      code: 'REDDIT_POST_ERROR',
      originalError: error
    } as SearchError;
  }
}