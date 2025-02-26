# Caching Strategy

This document outlines the caching strategy for the HackerHome application, detailing the implementation approaches, cache invalidation, and best practices.

## Caching Overview

HackerHome implements a comprehensive caching strategy to:

1. **Reduce API Calls**: Minimize redundant requests to external APIs
2. **Improve Performance**: Deliver content faster to users
3. **Handle Rate Limits**: Stay within API rate limits
4. **Enhance User Experience**: Provide immediate feedback while fetching fresh data

The PRD specifies a 5-minute cache duration for API responses, which is implemented across all data fetching mechanisms.

## Caching Layers

HackerHome implements caching at multiple layers:

1. **In-Memory Cache**: For server-side API requests
2. **SWR/React Query**: For client-side data fetching with stale-while-revalidate pattern
3. **Local Storage**: For user preferences and settings
4. **Service Worker**: For offline support (future enhancement)

## In-Memory Cache Implementation

### Cache Utility

The in-memory cache utility provides a simple way to cache API responses:

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

### Cache Key Generation

Generate consistent cache keys for different API requests:

```typescript
// src/lib/api/utils/cache-keys.ts

export function generateCacheKey(
  baseKey: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {}
    );
  
  return `${baseKey}:${JSON.stringify(filteredParams)}`;
}

// Usage example
const cacheKey = generateCacheKey('hackernews:top', {
  page: 0,
  pageSize: 10,
});
```

## SWR Implementation

### SWR Configuration

Configure SWR for optimal caching behavior:

```typescript
// src/lib/swr-config.tsx
'use client'

import { SWRConfig } from 'swr';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) => fetch(resource, init).then(res => res.json()),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 300000, // 5 minutes (as specified in PRD)
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

### Custom SWR Hooks

Create custom hooks for data fetching with SWR:

```typescript
// src/lib/hooks/use-hacker-news.ts
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { NewsItem } from '@/lib/api/types';

export function useHackerNewsFeed(pageSize = 10) {
  const getKey = (pageIndex: number, previousPageData: NewsItem[] | null) => {
    if (previousPageData && !previousPageData.length) return null;
    return `/api/hacker-news?page=${pageIndex}&pageSize=${pageSize}`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    getKey,
    {
      revalidateFirstPage: false,
      persistSize: true,
      dedupingInterval: 300000, // 5 minutes (as specified in PRD)
    }
  );

  const items = data ? data.flat() : [];
  const isLoading = !data && !error;
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.length === 0;
  const hasMore = !isEmpty && data && data[data.length - 1]?.length === pageSize;

  return {
    items,
    error,
    isLoading,
    isLoadingMore,
    loadMore: () => setSize(size + 1),
    hasMore,
    isValidating,
  };
}
```

### Combining Multiple Data Sources

Create a hook for combining data from multiple sources:

```typescript
// src/lib/hooks/use-combined-feed.ts
import { useMemo } from 'react';
import { useHackerNewsFeed } from './use-hacker-news';
import { useDevToFeed } from './use-devto';
import { useGitHubTrending } from './use-github';
import { NewsItem, Repository } from '@/lib/api/types';
import { useAppStore } from '@/lib/store/use-app-store';

export function useCombinedFeed() {
  // Get enabled sources from store
  const enabledSources = useAppStore(state => 
    state.sources.filter(source => source.enabled)
  );
  
  // Fetch data from enabled sources
  const fetchHackerNews = enabledSources.some(s => s.id === 'hackernews');
  const fetchDevTo = enabledSources.some(s => s.id === 'devto');
  const fetchGitHub = enabledSources.some(s => s.id === 'github');
  
  const {
    items: hackerNewsItems,
    isLoading: isLoadingHN,
    loadMore: loadMoreHN,
    hasMore: hasMoreHN,
  } = useHackerNewsFeed(fetchHackerNews ? 10 : 0);
  
  const {
    items: devToItems,
    isLoading: isLoadingDevTo,
    loadMore: loadMoreDevTo,
    hasMore: hasMoreDevTo,
  } = useDevToFeed(fetchDevTo ? 10 : 0);
  
  const {
    items: githubItems,
    isLoading: isLoadingGitHub,
    loadMore: loadMoreGitHub,
    hasMore: hasMoreGitHub,
  } = useGitHubTrending(fetchGitHub);
  
  // Transform GitHub repositories to a compatible format
  const transformedGithubItems = useMemo(() => {
    if (!fetchGitHub) return [];
    
    return githubItems.map((repo: Repository) => ({
      id: `github-${repo.id}`,
      title: `${repo.owner}/${repo.name}`,
      url: repo.url,
      source: 'github',
      points: repo.stars,
      commentCount: 0,
      author: repo.owner,
      timestamp: repo.timestamp,
      description: repo.description,
    }));
  }, [githubItems, fetchGitHub]);
  
  // Combine all items
  const allItems = useMemo(() => {
    const combined = [
      ...(fetchHackerNews ? hackerNewsItems : []),
      ...(fetchDevTo ? devToItems : []),
      ...(fetchGitHub ? transformedGithubItems : []),
    ];
    
    // Sort by timestamp (newest first)
    return combined.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [
    hackerNewsItems,
    devToItems,
    transformedGithubItems,
    fetchHackerNews,
    fetchDevTo,
    fetchGitHub,
  ]);
  
  const isLoading = (fetchHackerNews && isLoadingHN) || 
                    (fetchDevTo && isLoadingDevTo) || 
                    (fetchGitHub && isLoadingGitHub);
  
  // Load more function that loads more from all sources
  const loadMore = () => {
    if (fetchHackerNews && hasMoreHN) loadMoreHN();
    if (fetchDevTo && hasMoreDevTo) loadMoreDevTo();
    if (fetchGitHub && hasMoreGitHub) loadMoreGitHub();
  };
  
  const hasMore = (fetchHackerNews && hasMoreHN) || 
                  (fetchDevTo && hasMoreDevTo) || 
                  (fetchGitHub && hasMoreGitHub);
  
  return {
    items: allItems,
    isLoading,
    loadMore,
    hasMore,
  };
}
```

## Local Storage Caching

### User Preferences

Cache user preferences in local storage:

```typescript
// src/lib/hooks/use-local-storage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  // Update stored value if the key changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      console.error(error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);
  
  return [storedValue, setValue] as const;
}
```

### Zustand Persistence

Use Zustand's persist middleware for state persistence:

```typescript
// src/lib/store/use-app-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // State definition...
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // State implementation...
    }),
    {
      name: 'hackerhome-storage',
      partialize: (state) => ({
        // Only persist these fields
        mode: state.mode,
        sources: state.sources,
        theme: state.theme,
      }),
    }
  )
);
```

## Cache Invalidation Strategies

### Time-Based Invalidation

Invalidate cache entries after a specified duration:

```typescript
// Time-based invalidation is already implemented in fetchWithCache
// and SWR configuration with the 5-minute cache duration
```

### Manual Invalidation

Allow manual cache invalidation for specific scenarios:

```typescript
// src/lib/api/utils/cache-invalidation.ts
import { cache } from './fetch-with-cache';
import { mutate } from 'swr';

// Invalidate in-memory cache
export function invalidateCache(keyPattern: RegExp): void {
  for (const key of cache.keys()) {
    if (keyPattern.test(key)) {
      cache.delete(key);
    }
  }
}

// Invalidate SWR cache
export function invalidateSWRCache(keyPattern: RegExp): void {
  // Get all SWR cache keys
  const keys = Object.keys(window.__SWR__ || {});
  
  for (const key of keys) {
    if (keyPattern.test(key)) {
      mutate(key);
    }
  }
}

// Invalidate both caches
export function invalidateBothCaches(keyPattern: RegExp): void {
  invalidateCache(keyPattern);
  invalidateSWRCache(keyPattern);
}

// Example usage
// invalidateBothCaches(/^hackernews:/); // Invalidate all Hacker News cache entries
```

### Event-Based Invalidation

Invalidate cache based on specific events:

```typescript
// src/lib/events/cache-events.ts
import { invalidateBothCaches } from '@/lib/api/utils/cache-invalidation';

// Event types
export enum CacheInvalidationEvent {
  SOURCE_TOGGLE = 'source_toggle',
  REFRESH_ALL = 'refresh_all',
  USER_REQUESTED = 'user_requested',
}

// Event handlers
export function handleCacheInvalidationEvent(event: CacheInvalidationEvent, payload?: any): void {
  switch (event) {
    case CacheInvalidationEvent.SOURCE_TOGGLE:
      // Invalidate cache for the toggled source
      if (payload && payload.sourceId) {
        invalidateBothCaches(new RegExp(`^${payload.sourceId}:`));
      }
      break;
      
    case CacheInvalidationEvent.REFRESH_ALL:
      // Invalidate all caches
      invalidateBothCaches(/./);
      break;
      
    case CacheInvalidationEvent.USER_REQUESTED:
      // Invalidate specific cache based on user request
      if (payload && payload.pattern) {
        invalidateBothCaches(new RegExp(payload.pattern));
      }
      break;
      
    default:
      console.warn(`Unknown cache invalidation event: ${event}`);
  }
}
```

## Offline Support (Future Enhancement)

### Service Worker Registration

Register a service worker for offline support:

```typescript
// src/lib/service-worker/register.ts
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}
```

### Service Worker Implementation

Implement a service worker for caching:

```javascript
// public/service-worker.js
const CACHE_NAME = 'hackerhome-cache-v1';
const RUNTIME_CACHE = 'runtime-cache';

// Resources to cache on install
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
];

// Cache API routes
const API_CACHE_URLS = [
  '/api/hacker-news',
  '/api/devto',
  '/api/github',
];

// Install event - precache static resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return cacheNames.filter(
          cacheName => !currentCaches.includes(cacheName)
        );
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // API requests - network first, then cache
  if (API_CACHE_URLS.some(url => event.request.url.includes(url))) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
            // Cache the response
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => {
            // If network fails, try the cache
            return cache.match(event.request);
          });
      })
    );
    return;
  }
  
  // Static resources - cache first, then network
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(event.request).then(response => {
          // Cache the response for future
          return cache.put(event.request, response.clone()).then(() => {
            return response;
          });
        });
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-preferences') {
    event.waitUntil(syncPreferences());
  }
});

// Function to sync preferences when back online
async function syncPreferences() {
  const db = await openDB();
  const offlinePreferences = await db.getAll('offlinePreferences');
  
  for (const pref of offlinePreferences) {
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pref),
      });
      
      await db.delete('offlinePreferences', pref.id);
    } catch (error) {
      console.error('Failed to sync preference:', error);
    }
  }
}

// IndexedDB helper
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hackerhome-offline', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      db.createObjectStore('offlinePreferences', { keyPath: 'id' });
    };
    
    request.onsuccess = event => {
      resolve(event.target.result);
    };
    
    request.onerror = event => {
      reject(event.target.error);
    };
  });
}
```

## Caching Metrics and Monitoring

### Cache Hit Rate Tracking

Track cache hit rates to measure effectiveness:

```typescript
// src/lib/api/utils/cache-metrics.ts
interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
}

const metrics: Record<string, CacheMetrics> = {};

export function recordCacheHit(cacheKey: string): void {
  const source = cacheKey.split(':')[0];
  
  if (!metrics[source]) {
    metrics[source] = { hits: 0, misses: 0, hitRate: 0 };
  }
  
  metrics[source].hits++;
  updateHitRate(source);
}

export function recordCacheMiss(cacheKey: string): void {
  const source = cacheKey.split(':')[0];
  
  if (!metrics[source]) {
    metrics[source] = { hits: 0, misses: 0, hitRate: 0 };
  }
  
  metrics[source].misses++;
  updateHitRate(source);
}

function updateHitRate(source: string): void {
  const { hits, misses } = metrics[source];
  const total = hits + misses;
  
  metrics[source].hitRate = total > 0 ? hits / total : 0;
}

export function getCacheMetrics(): Record<string, CacheMetrics> {
  return { ...metrics };
}

export function resetCacheMetrics(): void {
  Object.keys(metrics).forEach(source => {
    metrics[source] = { hits: 0, misses: 0, hitRate: 0 };
  });
}
```

### Cache Size Monitoring

Monitor cache size to prevent memory issues:

```typescript
// src/lib/api/utils/cache-size.ts
import { cache } from './fetch-with-cache';

export function getCacheSize(): number {
  return cache.size;
}

export function estimateCacheMemoryUsage(): number {
  let totalSize = 0;
  
  for (const [key, value] of cache.entries()) {
    // Estimate key size
    totalSize += key.length * 2; // UTF-16 characters are 2 bytes each
    
    // Estimate value size (rough approximation)
    totalSize += JSON.stringify(value.data).length * 2;
  }
  
  return totalSize;
}

export function monitorCacheSize(maxSizeBytes: number = 10 * 1024 * 1024): void {
  // Check cache size every minute
  setInterval(() => {
    const sizeBytes = estimateCacheMemoryUsage();
    
    if (sizeBytes > maxSizeBytes) {
      console.warn(`Cache size (${sizeBytes} bytes) exceeds limit (${maxSizeBytes} bytes). Clearing oldest entries.`);
      clearOldestCacheEntries(0.5); // Clear 50% of oldest entries
    }
  }, 60000);
}

export function clearOldestCacheEntries(percentage: number = 0.25): void {
  const entries = Array.from(cache.entries());
  
  // Sort by timestamp (oldest first)
  entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
  
  // Calculate how many entries to remove
  const removeCount = Math.floor(entries.length * percentage);
  
  // Remove oldest entries
  for (let i = 0; i < removeCount; i++) {
    cache.delete(entries[i][0]);
  }
}
```

## Caching Best Practices

### Performance Optimization

- Use appropriate cache durations based on data volatility
- Implement stale-while-revalidate pattern for fresh data
- Cache at the appropriate level (memory, localStorage, etc.)
- Use cache keys that are specific but not too granular

### Memory Management

- Monitor cache size to prevent memory issues
- Implement cache eviction policies (LRU, time-based, etc.)
- Clear expired cache entries periodically
- Use appropriate data structures for efficient cache lookups

### User Experience

- Show loading states for uncached data
- Provide refresh mechanisms for users to force updates
- Implement optimistic UI updates for better perceived performance
- Handle offline scenarios gracefully

### Security Considerations

- Don't cache sensitive user data in client-side storage
- Implement proper cache headers for HTTP responses
- Use HTTPS for all API requests
- Clear cache on user logout for sensitive applications

## Testing Caching Implementation

### Unit Tests

Test cache utility functions:

```typescript
// src/lib/api/utils/fetch-with-cache.test.ts
import { fetchWithCache, clearExpiredCache } from './fetch-with-cache';

describe('fetchWithCache', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearExpiredCache();
    
    // Mock fetch
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      })
    );
  });
  
  test('should fetch data and cache it', async () => {
    const data1 = await fetchWithCache('https://example.com/api');
    
    // Should have made a fetch request
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(data1).toEqual({ data: 'test' });
    
    // Reset mock to track new calls
    fetch.mockClear();
    
    // Second call should use cache
    const data2 = await fetchWithCache('https://example.com/api');
    
    // Should not have made another fetch request
    expect(fetch).not.toHaveBeenCalled();
    expect(data2).toEqual({ data: 'test' });
  });
  
  // More tests...
});
```

### Integration Tests

Test caching with components:

```typescript
// src/components/features/news-feed.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { NewsFeed } from './news-feed';
import { mockHackerNewsStories } from '@/lib/api/__mocks__/hacker-news';

// Mock fetch
global.fetch = jest.fn();

describe('NewsFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful fetch
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockHackerNewsStories),
      })
    );
  });
  
  test('should fetch data and render items', async () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <NewsFeed mode="simple" />
      </SWRConfig>
    );
    
    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Should render items after data is loaded
    await waitFor(() => {
      expect(screen.getByText('Test Hacker News Story')).toBeInTheDocument();
    });
    
    // Should have made a fetch request
    expect(fetch).toHaveBeenCalledTimes(1);
    
    // Reset mock to track new calls
    (global.fetch as jest.Mock).mockClear();
    
    // Re-render component (should use cache)
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <NewsFeed mode="simple" />
      </SWRConfig>
    );
    
    // Should render items immediately (from cache)
    expect(screen.getByText('Test Hacker News Story')).toBeInTheDocument();
    
    // Should not have made another fetch request
    expect(fetch).not.toHaveBeenCalled();
  });
  
  // More tests...
});