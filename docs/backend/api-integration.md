# API Integration

This document outlines the approach for integrating with external APIs in the HackerHome application, detailing the implementation strategies, error handling, and best practices.

## API Integration Overview

HackerHome integrates with multiple external APIs to aggregate technology news and trending information:

1. **Hacker News API**: For tech news and discussions
2. **DEV.to API**: For developer articles and tutorials
3. **GitHub API**: For trending repositories
4. **Product Hunt API**: For new product launches
5. **Medium API**: For tech-related articles

## API Client Architecture

The API integration follows a modular architecture with separate clients for each API source:

```
src/
└── lib/
    └── api/
        ├── index.ts           # Exports all API clients
        ├── types.ts           # Common type definitions
        ├── hacker-news.ts     # Hacker News API client
        ├── devto.ts           # DEV.to API client
        ├── github.ts          # GitHub API client
        ├── product-hunt.ts    # Product Hunt API client
        ├── medium.ts          # Medium API client
        └── utils/
            ├── fetch-with-cache.ts  # Caching utility
            ├── error-handling.ts    # Error handling utilities
            └── rate-limiting.ts     # Rate limiting utilities
```

## Common API Types

Define common types for consistent data handling across different sources:

```typescript
// src/lib/api/types.ts

// Common news item interface
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: 'hackernews' | 'devto' | 'medium';
  points?: number;
  commentCount?: number;
  author?: string;
  timestamp: string;
  tags?: string[];
}

// Common repository interface
export interface Repository {
  id: string;
  name: string;
  owner: string;
  url: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  timestamp: string;
}

// Common product interface
export interface Product {
  id: string;
  name: string;
  tagline: string;
  url: string;
  thumbnailUrl: string;
  votesCount: number;
  commentsCount: number;
  timestamp: string;
  topics: string[];
}

// API response error
export interface ApiError {
  status: number;
  message: string;
  source: string;
}
```

## API Client Implementation

### Base Fetch Utility

Create a base fetch utility with caching, error handling, and rate limiting:

```typescript
// src/lib/api/utils/fetch-with-cache.ts
import { ApiError } from '../types';

const API_CACHE_DURATION = 300000; // 5 minutes (as specified in PRD)

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

export async function fetchWithCache<T>(
  url: string,
  options?: RequestInit,
  source: string = 'unknown'
): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  const now = Date.now();
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < API_CACHE_DURATION) {
    return cached.data as T;
  }
  
  try {
    // Fetch fresh data
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new ApiError({
        status: response.status,
        message: `API request failed with status ${response.status}`,
        source,
      });
    }
    
    const data = await response.json();
    
    // Update cache
    cache.set(cacheKey, { data, timestamp: now });
    
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError({
      status: 0,
      message: error instanceof Error ? error.message : String(error),
      source,
    });
  }
}

// Clear expired cache entries
export function clearExpiredCache(): void {
  const now = Date.now();
  
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > API_CACHE_DURATION) {
      cache.delete(key);
    }
  }
}

// Set up periodic cache cleanup
if (typeof window !== 'undefined') {
  setInterval(clearExpiredCache, API_CACHE_DURATION);
}
```

### Hacker News API Client

```typescript
// src/lib/api/hacker-news.ts
import { fetchWithCache } from './utils/fetch-with-cache';
import { NewsItem } from './types';

const API_BASE_URL = 'https://hacker-news.firebaseio.com/v0';
const SOURCE = 'hackernews';

interface HNItem {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
  kids?: number[];
}

export async function fetchTopStories(page = 0, pageSize = 10): Promise<NewsItem[]> {
  // Fetch top story IDs
  const storyIds = await fetchWithCache<number[]>(
    `${API_BASE_URL}/topstories.json`,
    undefined,
    SOURCE
  );
  
  // Calculate pagination
  const start = page * pageSize;
  const end = start + pageSize;
  const paginatedIds = storyIds.slice(start, end);
  
  // Fetch story details in parallel
  const stories = await Promise.all(
    paginatedIds.map(id => 
      fetchWithCache<HNItem>(
        `${API_BASE_URL}/item/${id}.json`,
        undefined,
        SOURCE
      )
    )
  );
  
  // Transform to common format
  return stories.map(item => ({
    id: item.id.toString(),
    title: item.title,
    url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
    source: SOURCE,
    points: item.score,
    commentCount: item.descendants,
    author: item.by,
    timestamp: new Date(item.time * 1000).toISOString(),
  }));
}

export async function fetchNewStories(page = 0, pageSize = 10): Promise<NewsItem[]> {
  // Similar implementation as fetchTopStories but using newstories.json
  const storyIds = await fetchWithCache<number[]>(
    `${API_BASE_URL}/newstories.json`,
    undefined,
    SOURCE
  );
  
  // Rest of implementation...
}

export async function fetchStory(id: number): Promise<NewsItem> {
  const item = await fetchWithCache<HNItem>(
    `${API_BASE_URL}/item/${id}.json`,
    undefined,
    SOURCE
  );
  
  return {
    id: item.id.toString(),
    title: item.title,
    url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
    source: SOURCE,
    points: item.score,
    commentCount: item.descendants,
    author: item.by,
    timestamp: new Date(item.time * 1000).toISOString(),
  };
}
```

### DEV.to API Client

```typescript
// src/lib/api/devto.ts
import { fetchWithCache } from './utils/fetch-with-cache';
import { NewsItem } from './types';

const API_BASE_URL = 'https://dev.to/api';
const SOURCE = 'devto';

interface DevToArticle {
  id: number;
  title: string;
  url: string;
  published_at: string;
  tag_list: string[];
  user: {
    name: string;
  };
  comments_count: number;
  public_reactions_count: number;
  reading_time_minutes: number;
  cover_image: string | null;
}

export async function fetchArticles(
  page = 1,
  pageSize = 10,
  tag?: string
): Promise<NewsItem[]> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: pageSize.toString(),
  });
  
  if (tag) {
    params.append('tag', tag);
  }
  
  const articles = await fetchWithCache<DevToArticle[]>(
    `${API_BASE_URL}/articles?${params.toString()}`,
    undefined,
    SOURCE
  );
  
  return articles.map(article => ({
    id: article.id.toString(),
    title: article.title,
    url: article.url,
    source: SOURCE,
    commentCount: article.comments_count,
    points: article.public_reactions_count,
    author: article.user.name,
    timestamp: article.published_at,
    tags: article.tag_list,
  }));
}

export async function fetchArticleById(id: number): Promise<NewsItem> {
  const article = await fetchWithCache<DevToArticle>(
    `${API_BASE_URL}/articles/${id}`,
    undefined,
    SOURCE
  );
  
  return {
    id: article.id.toString(),
    title: article.title,
    url: article.url,
    source: SOURCE,
    commentCount: article.comments_count,
    points: article.public_reactions_count,
    author: article.user.name,
    timestamp: article.published_at,
    tags: article.tag_list,
  };
}
```

### GitHub API Client

```typescript
// src/lib/api/github.ts
import { fetchWithCache } from './utils/fetch-with-cache';
import { Repository } from './types';

const API_BASE_URL = 'https://api.github.com';
const SOURCE = 'github';

interface GitHubRepo {
  id: number;
  name: string;
  owner: {
    login: string;
  };
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  created_at: string;
}

export async function fetchTrendingRepositories(
  language?: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<Repository[]> {
  // GitHub doesn't have a direct trending API, so we use a search query
  const date = new Date();
  let dateQuery: string;
  
  switch (period) {
    case 'daily':
      date.setDate(date.getDate() - 1);
      dateQuery = date.toISOString().split('T')[0];
      break;
    case 'weekly':
      date.setDate(date.getDate() - 7);
      dateQuery = date.toISOString().split('T')[0];
      break;
    case 'monthly':
      date.setMonth(date.getMonth() - 1);
      dateQuery = date.toISOString().split('T')[0];
      break;
  }
  
  const query = `created:>${dateQuery}${language ? ` language:${language}` : ''}`;
  const params = new URLSearchParams({
    q: query,
    sort: 'stars',
    order: 'desc',
    per_page: '20',
  });
  
  const response = await fetchWithCache<{ items: GitHubRepo[] }>(
    `${API_BASE_URL}/search/repositories?${params.toString()}`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    },
    SOURCE
  );
  
  return response.items.map(repo => ({
    id: repo.id.toString(),
    name: repo.name,
    owner: repo.owner.login,
    url: repo.html_url,
    description: repo.description || '',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language || 'Unknown',
    timestamp: repo.created_at,
  }));
}

export async function fetchRepositoryById(owner: string, repo: string): Promise<Repository> {
  const repository = await fetchWithCache<GitHubRepo>(
    `${API_BASE_URL}/repos/${owner}/${repo}`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    },
    SOURCE
  );
  
  return {
    id: repository.id.toString(),
    name: repository.name,
    owner: repository.owner.login,
    url: repository.html_url,
    description: repository.description || '',
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    language: repository.language || 'Unknown',
    timestamp: repository.created_at,
  };
}
```

### Product Hunt API Client (GraphQL)

```typescript
// src/lib/api/product-hunt.ts
import { fetchWithCache } from './utils/fetch-with-cache';
import { Product } from './types';

const API_BASE_URL = 'https://api.producthunt.com/v2/api/graphql';
const SOURCE = 'producthunt';

// You'll need to get an API token from Product Hunt
const API_TOKEN = process.env.NEXT_PUBLIC_PRODUCT_HUNT_API_KEY;

interface ProductHuntPost {
  id: string;
  name: string;
  tagline: string;
  url: string;
  thumbnail: {
    url: string;
  };
  votesCount: number;
  commentsCount: number;
  createdAt: string;
  topics: {
    edges: Array<{
      node: {
        name: string;
      };
    }>;
  };
}

interface ProductHuntResponse {
  data: {
    posts: {
      edges: Array<{
        node: ProductHuntPost;
      }>;
    };
  };
}

export async function fetchLatestProducts(page = 1, pageSize = 10): Promise<Product[]> {
  if (!API_TOKEN) {
    throw new Error('Product Hunt API token is not configured');
  }
  
  const query = `
    query {
      posts(first: ${pageSize}, after: "${(page - 1) * pageSize}") {
        edges {
          node {
            id
            name
            tagline
            url
            thumbnail {
              url
            }
            votesCount
            commentsCount
            createdAt
            topics(first: 5) {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;
  
  const response = await fetchWithCache<ProductHuntResponse>(
    API_BASE_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    },
    SOURCE
  );
  
  return response.data.posts.edges.map(({ node }) => ({
    id: node.id,
    name: node.name,
    tagline: node.tagline,
    url: node.url,
    thumbnailUrl: node.thumbnail.url,
    votesCount: node.votesCount,
    commentsCount: node.commentsCount,
    timestamp: node.createdAt,
    topics: node.topics.edges.map(edge => edge.node.name),
  }));
}
```

## API Integration in Next.js

### Route Handlers

Create route handlers to proxy API requests:

```typescript
// src/app/api/hacker-news/route.ts
import { NextResponse } from 'next/server';
import { fetchTopStories, fetchNewStories } from '@/lib/api/hacker-news';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const feed = searchParams.get('feed') || 'top';
  
  try {
    let stories;
    
    if (feed === 'new') {
      stories = await fetchNewStories(page, pageSize);
    } else {
      stories = await fetchTopStories(page, pageSize);
    }
    
    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching Hacker News stories:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
```

### Server Components

Use server components for data fetching:

```typescript
// src/app/(simple)/page.tsx
import { fetchTopStories } from '@/lib/api/hacker-news';
import { fetchArticles } from '@/lib/api/devto';
import { fetchTrendingRepositories } from '@/lib/api/github';
import { NewsFeed } from '@/components/features/news-feed';

export default async function HomePage() {
  // Fetch data in parallel
  const [hackerNewsStories, devToArticles, githubRepos] = await Promise.all([
    fetchTopStories(0, 10),
    fetchArticles(1, 10),
    fetchTrendingRepositories(),
  ]);
  
  // Combine and sort by timestamp
  const allItems = [
    ...hackerNewsStories,
    ...devToArticles,
    // Transform GitHub repos to a compatible format if needed
  ].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return (
    <main>
      <NewsFeed initialItems={allItems} mode="simple" />
    </main>
  );
}
```

## Error Handling

### API Error Class

Create a custom error class for API errors:

```typescript
// src/lib/api/utils/error-handling.ts
import { ApiError } from '../types';

export function handleApiError(error: unknown, source: string): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  
  return {
    status: 0,
    message: error instanceof Error ? error.message : String(error),
    source,
  };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    'source' in error
  );
}
```

### Error Boundary Component

Create an error boundary component for handling API errors:

```tsx
// src/components/error/api-error-boundary.tsx
'use client'

import { useEffect, useState } from 'react';
import { isApiError } from '@/lib/api/utils/error-handling';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ApiErrorBoundary({
  children,
  fallback,
}: ApiErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (isApiError(event.error)) {
        setError(event.error);
        event.preventDefault();
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-medium">Error loading content</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setError(null)}
        >
          Try again
        </Button>
      </div>
    );
  }
  
  return <>{children}</>;
}
```

## Rate Limiting

Implement rate limiting to avoid API restrictions:

```typescript
// src/lib/api/utils/rate-limiting.ts
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitState {
  requests: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitState>();

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): boolean {
  const now = Date.now();
  const state = rateLimits.get(key) || { requests: 0, resetTime: now + config.windowMs };
  
  // Reset if window has passed
  if (now > state.resetTime) {
    rateLimits.set(key, {
      requests: 1,
      resetTime: now + config.windowMs,
    });
    return true;
  }
  
  // Check if limit exceeded
  if (state.requests >= config.maxRequests) {
    return false;
  }
  
  // Increment request count
  rateLimits.set(key, {
    requests: state.requests + 1,
    resetTime: state.resetTime,
  });
  
  return true;
}

export function getRateLimitRemaining(key: string): number {
  const state = rateLimits.get(key);
  if (!state) return 0;
  
  const config = getConfigForKey(key);
  return Math.max(0, config.maxRequests - state.requests);
}

function getConfigForKey(key: string): RateLimitConfig {
  // Define rate limits for different APIs
  switch (key) {
    case 'github':
      return { maxRequests: 60, windowMs: 60 * 60 * 1000 }; // 60 requests per hour
    case 'producthunt':
      return { maxRequests: 100, windowMs: 60 * 60 * 1000 }; // 100 requests per hour
    default:
      return { maxRequests: 100, windowMs: 60 * 1000 }; // 100 requests per minute
  }
}
```

## API Integration Testing

### Mock API Responses

Create mock API responses for testing:

```typescript
// src/lib/api/__mocks__/hacker-news.ts
import { NewsItem } from '../types';

export const mockHackerNewsStories: NewsItem[] = [
  {
    id: '1',
    title: 'Test Hacker News Story',
    url: 'https://example.com/hn-story',
    source: 'hackernews',
    points: 100,
    commentCount: 42,
    author: 'testuser',
    timestamp: '2023-01-01T00:00:00Z',
  },
  // More mock stories...
];

export async function fetchTopStories(): Promise<NewsItem[]> {
  return mockHackerNewsStories;
}

export async function fetchNewStories(): Promise<NewsItem[]> {
  return mockHackerNewsStories;
}

export async function fetchStory(id: number): Promise<NewsItem> {
  return mockHackerNewsStories.find(story => story.id === id.toString()) || mockHackerNewsStories[0];
}
```

### API Client Tests

Test API clients with mock responses:

```typescript
// src/lib/api/hacker-news.test.ts
import { fetchTopStories, fetchNewStories, fetchStory } from './hacker-news';
import { fetchWithCache } from './utils/fetch-with-cache';

// Mock fetchWithCache
jest.mock('./utils/fetch-with-cache');

describe('Hacker News API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('fetchTopStories should fetch and transform top stories', async () => {
    // Mock API response
    const mockStoryIds = [1, 2, 3];
    const mockStory = {
      id: 1,
      title: 'Test Story',
      url: 'https://example.com',
      score: 100,
      by: 'testuser',
      time: 1609459200, // 2021-01-01T00:00:00Z
      descendants: 42,
    };
    
    // Set up mocks
    (fetchWithCache as jest.Mock).mockImplementation((url) => {
      if (url.includes('topstories.json')) {
        return Promise.resolve(mockStoryIds);
      }
      return Promise.resolve(mockStory);
    });
    
    // Call the function
    const result = await fetchTopStories(0, 3);
    
    // Assertions
    expect(fetchWithCache).toHaveBeenCalledTimes(4); // 1 for IDs + 3 for stories
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: '1',
      title: 'Test Story',
      url: 'https://example.com',
      source: 'hackernews',
      points: 100,
      commentCount: 42,
      author: 'testuser',
      timestamp: '2021-01-01T00:00:00.000Z',
    });
  });
  
  // More tests...
});
```

## API Integration Best Practices

### Error Handling

- Always handle API errors gracefully
- Provide meaningful error messages to users
- Implement retry mechanisms for transient errors
- Log errors for debugging

### Caching

- Cache API responses to reduce redundant requests
- Implement cache invalidation strategies
- Use stale-while-revalidate pattern for fresh data

### Performance

- Fetch data in parallel when possible
- Use pagination to limit data size
- Implement request batching for multiple small requests

### Security

- Never expose API keys in client-side code
- Use environment variables for sensitive information
- Implement proper CORS and CSP configurations

### Maintainability

- Use consistent error handling across all API clients
- Document API endpoints and response formats
- Write tests for API integration code
- Keep API clients modular and focused