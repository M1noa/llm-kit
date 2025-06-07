# Reddit Module 📱

!! THIS DOESENT WORK ON DATA SERVERS OR VPNS !!

The Reddit module provides functionality for fetching and searching Reddit content, including hot posts from subreddits, search functionality, and post information.

## Functions

### getSubredditHot(subreddit: string, limit?: number)

Get hot posts from a specified subreddit.

```typescript
import { getSubredditHot } from "llm-kit";

// Get top 25 hot posts from r/news
const posts = await getSubredditHot("news");

// Get top 5 hot posts from r/programming
const programmingPosts = await getSubredditHot("programming", 5);
```

### searchReddit(query: string, options?: SearchOptions)

Search Reddit posts with various options.

```typescript
import { searchReddit } from "llm-kit";

// Basic search
const results = await searchReddit("typescript tutorial");

// Advanced search with options
const advancedResults = await searchReddit("javascript", {
  sort: "hot",
  limit: 10,
  type: "posts",
});
```

### getPostFromUrl(url: string)

Get detailed information about a Reddit post from its URL.

```typescript
import { getPostFromUrl } from "llm-kit";

// Get post info
const post = await getPostFromUrl(
  "https://www.reddit.com/r/programming/comments/xyz/some_post"
);
```

## Reddit Post Type

All functions return data in the RedditPost format:

```typescript
interface RedditPost {
  title: string; // post title
  id: string; // unique post id
  url: string; // url of the post content
  permalink: string; // full reddit url to the post
  author: string; // username of poster
  score: number; // upvote score
  num_comments: number; // number of comments
  created_utc: number; // creation timestamp
  selftext?: string; // post content for text posts
  subreddit: string; // subreddit name
  is_self: boolean; // true if text post
}
```

## Integration with Webpage Module

The Reddit module is integrated with the webpage module, allowing direct content extraction from Reddit post URLs:

```typescript
import { getWebpageContent } from "llm-kit";

// Get content from a Reddit post
const content = await getWebpageContent(
  "https://www.reddit.com/r/programming/comments/xyz/some_post"
);

// Content includes Reddit-specific metadata
console.log(content.metadata); // { author, score, numComments, createdAt }
```

## Error Handling

All functions throw a `SearchError` on failure:

```typescript
try {
  const posts = await getSubredditHot("nonexistent");
} catch (err) {
  if (err.code === "REDDIT_ERROR") {
    console.log("Reddit API error:", err.message);
  }
}
```

## Tips

- Reddit API has rate limits, so consider caching results for frequently accessed content
- Use appropriate error handling as Reddit API can be occasionally unstable
- The `limit` parameter helps control response size and load times
- Webpage integration automatically extracts readable content from post URLs
