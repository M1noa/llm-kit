// hackernews.ts - get them spicy tech stories n stuff

import { HackerNewsResult, SearchError } from '../types';

const API_BASE = 'https://hacker-news.firebaseio.com/v0';

// convert hn item to our format
function formatHNResult(item: any): HackerNewsResult {
  if (!item) {
    return {
      title: 'Unknown Story',
      url: 'https://news.ycombinator.com',
      snippet: '',
      source: 'hackernews'
    };
  }
  
  return {
    title: item.title || 'Untitled',
    url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
    snippet: item.text || '',
    source: 'hackernews',
    points: item.score || 0,
    author: item.by || 'anonymous',
    comments: item.descendants || 0,
    time: item.time ? new Date(item.time * 1000) : new Date()
  };
}

async function fetchItem(id: number): Promise<any> {
  const response = await fetch(`${API_BASE}/item/${id}.json`);
  return response.json();
}

async function fetchStories(type: string, limit: number = 10): Promise<HackerNewsResult[]> {
  try {
    const response = await fetch(`${API_BASE}/${type}.json`);
    const ids = await response.json();
    
    // get first 'limit' number of stories
    const storyIds = ids.slice(0, limit);
    
    // fetch all stories in parallel
    const stories = await Promise.all(storyIds.map(fetchItem));
    return stories.filter(Boolean).map(formatHNResult);
  } catch (err) {
    throw {
      message: `failed to get ${type} stories :(`,
      code: `HN_${type.toUpperCase()}_ERROR`,
      originalError: err
    } as SearchError;
  }
}

export async function getTopStories(limit: number = 10): Promise<HackerNewsResult[]> {
  return fetchStories('topstories', limit);
}

export async function getNewStories(limit: number = 10): Promise<HackerNewsResult[]> {
  return fetchStories('newstories', limit);
}

export async function getBestStories(limit: number = 10): Promise<HackerNewsResult[]> {
  return fetchStories('beststories', limit);
}

export async function getAskStories(limit: number = 10): Promise<HackerNewsResult[]> {
  return fetchStories('askstories', limit);
}

export async function getShowStories(limit: number = 10): Promise<HackerNewsResult[]> {
  return fetchStories('showstories', limit);
}

export async function getJobStories(limit: number = 10): Promise<HackerNewsResult[]> {
  return fetchStories('jobstories', limit);
}

export async function getStoryById(id: number): Promise<HackerNewsResult> {
  try {
    const story = await fetchItem(id);
    return formatHNResult(story);
  } catch (err) {
    throw {
      message: 'failed to get story :(',
      code: 'HN_STORY_ERROR',
      originalError: err
    } as SearchError;
  }
}