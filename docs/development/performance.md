# Performance Optimization

This document outlines the performance optimization strategies for the HackerHome application, detailing techniques, best practices, and tools for ensuring a fast and responsive user experience.

## Performance Goals

HackerHome aims to meet the following performance targets as specified in the PRD:

- **Page Load Time**: Under 2 seconds
- **Time to Interactive**: Under 3 seconds
- **First Contentful Paint**: Under 1 second
- **Smooth Scrolling**: Maintain 60 fps
- **Core Web Vitals**:
  - Largest Contentful Paint (LCP): < 2.5s
  - First Input Delay (FID): < 100ms
  - Cumulative Layout Shift (CLS): < 0.1

## Performance Optimization Strategies

### Code Optimization

#### Component Optimization

1. **Memoization**

Use React's memoization features to prevent unnecessary re-renders:

```tsx
import React, { useMemo, useCallback, memo } from 'react';

// Memoize a component
const NewsCard = memo(function NewsCard({ title, url, source }: NewsCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-medium">
        <a href={url}>{title}</a>
      </h3>
      <p className="text-sm text-muted-foreground">{source}</p>
    </div>
  );
});

// Parent component using memoized values and callbacks
function NewsFeed({ items }: { items: NewsItem[] }) {
  // Memoize expensive calculations
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [items]);
  
  // Memoize callback functions
  const handleItemClick = useCallback((id: string) => {
    console.log(`Item clicked: ${id}`);
  }, []);
  
  return (
    <div className="space-y-4">
      {sortedItems.map(item => (
        <NewsCard
          key={item.id}
          {...item}
          onClick={() => handleItemClick(item.id)}
        />
      ))}
    </div>
  );
}
```

2. **Avoid Inline Function Definitions**

Avoid creating new function instances on each render:

```tsx
// Bad - creates a new function on each render
<Button onClick={() => handleClick(id)}>Click me</Button>

// Good - use useCallback to memoize the function
const handleButtonClick = useCallback(() => {
  handleClick(id);
}, [id, handleClick]);

<Button onClick={handleButtonClick}>Click me</Button>
```

3. **Optimize Context Usage**

Split contexts to avoid unnecessary re-renders:

```tsx
// Instead of one large context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Split into smaller, focused contexts
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);
const SourcesContext = createContext<SourcesContextType | undefined>(undefined);
```

#### State Management Optimization

1. **Selective Re-rendering with Zustand**

Use Zustand's selective subscription to prevent unnecessary re-renders:

```tsx
import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  sources: Source[];
  toggleSource: (id: string) => void;
}

const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  sources: [],
  toggleSource: (id) => set((state) => ({
    sources: state.sources.map(source => 
      source.id === id ? { ...source, enabled: !source.enabled } : source
    )
  })),
}));

// Component only re-renders when theme changes
function ThemeToggle() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}

// Component only re-renders when sources change
function SourcesList() {
  const sources = useAppStore((state) => state.sources);
  const toggleSource = useAppStore((state) => state.toggleSource);
  
  return (
    <ul>
      {sources.map(source => (
        <li key={source.id}>
          <label>
            <input
              type="checkbox"
              checked={source.enabled}
              onChange={() => toggleSource(source.id)}
            />
            {source.name}
          </label>
        </li>
      ))}
    </ul>
  );
}
```

2. **Optimize SWR Cache Configuration**

Configure SWR for optimal performance:

```tsx
import { SWRConfig } from 'swr';

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) => fetch(resource, init).then(res => res.json()),
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 300000, // 5 minutes (as specified in PRD)
        focusThrottleInterval: 5000,
        loadingTimeout: 3000,
        errorRetryInterval: 5000,
        errorRetryCount: 3,
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
}
```

### Rendering Optimization

#### Server Components

Use Next.js Server Components for data fetching and static content:

```tsx
// app/page.tsx (Server Component)
import { fetchTopStories } from '@/lib/api/hacker-news';
import { NewsFeed } from '@/components/news-feed';

// This component runs on the server
export default async function HomePage() {
  // Fetch data on the server
  const stories = await fetchTopStories();
  
  return (
    <main>
      <h1 className="text-3xl font-bold">Latest News</h1>
      {/* Pass server data to client component */}
      <NewsFeed initialItems={stories} />
    </main>
  );
}
```

#### Client Components

Use Client Components for interactive elements:

```tsx
// components/news-feed.tsx
'use client'

import { useState } from 'react';
import { NewsCard } from '@/components/news-card';
import { useInfiniteScroll } from '@/lib/hooks/use-infinite-scroll';
import type { NewsItem } from '@/types';

interface NewsFeedProps {
  initialItems: NewsItem[];
}

export function NewsFeed({ initialItems }: NewsFeedProps) {
  const { items, isLoading, loadMore, hasMore } = useInfiniteScroll(initialItems);
  
  return (
    <div className="space-y-4">
      {items.map(item => (
        <NewsCard key={item.id} {...item} />
      ))}
      
      {isLoading && <div>Loading more...</div>}
      
      {hasMore && !isLoading && (
        <button
          onClick={loadMore}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Load More
        </button>
      )}
    </div>
  );
}
```

#### Streaming and Suspense

Use streaming and Suspense for progressive rendering:

```tsx
// app/page.tsx
import { Suspense } from 'react';
import { HackerNewsSection } from '@/components/hacker-news-section';
import { DevToSection } from '@/components/devto-section';
import { GitHubSection } from '@/components/github-section';
import { LoadingSkeleton } from '@/components/loading-skeleton';

export default function HomePage() {
  return (
    <main>
      <h1 className="text-3xl font-bold">Tech News Aggregator</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<LoadingSkeleton />}>
          <HackerNewsSection />
        </Suspense>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <DevToSection />
        </Suspense>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <GitHubSection />
        </Suspense>
      </div>
    </main>
  );
}
```

### Asset Optimization

#### Image Optimization

Use Next.js Image component for optimized images:

```tsx
import Image from 'next/image';

export function ArticleCard({ title, coverImage }: ArticleCardProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority={false}
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
    </div>
  );
}
```

#### Font Optimization

Optimize font loading:

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

// Load Inter font with specific subsets
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

#### CSS Optimization

Optimize CSS with Tailwind:

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Theme configuration
  },
  plugins: [],
  // Reduce CSS size in production
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
```

### Code Splitting

#### Dynamic Imports

Use dynamic imports to split code into smaller chunks:

```tsx
import dynamic from 'next/dynamic';

// Dynamically import a component
const DynamicChart = dynamic(() => import('@/components/chart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // Disable server-side rendering if needed
});

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <DynamicChart />
    </div>
  );
}
```

#### Route-Based Code Splitting

Next.js automatically splits code by routes:

```
app/
├── page.tsx           # Home page bundle
├── about/
│   └── page.tsx       # About page bundle
└── settings/
    └── page.tsx       # Settings page bundle
```

#### Component-Level Code Splitting

Split large components:

```tsx
// Import only when needed
const AdvancedFilters = dynamic(() => import('@/components/advanced-filters'), {
  ssr: false,
});

function SearchPage() {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  return (
    <div>
      <input type="text" placeholder="Search..." />
      <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
        {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
      </button>
      
      {showAdvancedFilters && <AdvancedFilters />}
    </div>
  );
}
```

### Data Fetching Optimization

#### Parallel Data Fetching

Fetch data in parallel:

```tsx
// Fetch multiple data sources in parallel
async function fetchAllData() {
  const [hackerNewsData, devToData, githubData] = await Promise.all([
    fetchHackerNews(),
    fetchDevTo(),
    fetchGitHub(),
  ]);
  
  return {
    hackerNews: hackerNewsData,
    devTo: devToData,
    github: githubData,
  };
}
```

#### Incremental Static Regeneration (ISR)

Use ISR for semi-static data:

```tsx
// pages/api/news.js (API Route)
export default async function handler(req, res) {
  const data = await fetchNews();
  
  // Set cache headers
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  
  res.status(200).json(data);
}
```

#### SWR for Client-Side Data Fetching

Use SWR with proper caching:

```tsx
import useSWR from 'swr';

function useNews() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    '/api/news',
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
      refreshInterval: 300000, // 5 minutes
    }
  );
  
  return {
    news: data,
    isLoading,
    isError: error,
    isRefreshing: isValidating,
    refresh: mutate,
  };
}
```

### Caching Strategy

#### Browser Caching

Set appropriate cache headers:

```tsx
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};
```

#### Memory Caching

Implement in-memory caching for API requests:

```typescript
// lib/api/utils/cache.ts
const CACHE_DURATION = 300000; // 5 minutes (as specified in PRD)
const cache = new Map<string, { data: any; timestamp: number }>();

export async function fetchWithCache<T>(url: string, options?: RequestInit): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  const now = Date.now();
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  
  // Fetch fresh data
  const response = await fetch(url, options);
  const data = await response.json();
  
  // Update cache
  cache.set(cacheKey, { data, timestamp: now });
  
  return data as T;
}
```

#### Local Storage Caching

Cache user preferences in local storage:

```typescript
// lib/hooks/use-local-storage.ts
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
  
  return [storedValue, setValue] as const;
}
```

### UI Rendering Optimization

#### Virtualization

Use virtualization for long lists:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualizedList({ items }: { items: NewsItem[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
    overscan: 5, // Number of items to render outside of the visible area
  });
  
  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            className="absolute top-0 left-0 w-full"
            style={{
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <NewsCard {...items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Skeleton Loading

Use skeleton loading for better perceived performance:

```tsx
function NewsCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 animate-pulse">
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
    </div>
  );
}

function NewsFeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <NewsCardSkeleton key={index} />
      ))}
    </div>
  );
}
```

#### Lazy Loading

Lazy load below-the-fold content:

```tsx
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

function LazyLoadedSection({ onLoad, children }: { onLoad: () => void; children: React.ReactNode }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px', // Load when within 200px of viewport
  });
  
  useEffect(() => {
    if (inView) {
      onLoad();
    }
  }, [inView, onLoad]);
  
  return <div ref={ref}>{inView ? children : <div className="h-48" />}</div>;
}
```

### Animation Optimization

#### CSS Transitions

Use CSS transitions for simple animations:

```css
.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

#### Framer Motion Optimization

Optimize Framer Motion animations:

```tsx
import { motion } from 'framer-motion';

function OptimizedAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        // Use hardware acceleration
        type: 'tween',
      }}
      // Optimize for animations
      style={{ willChange: 'opacity, transform' }}
    >
      Animated content
    </motion.div>
  );
}
```

#### Reduced Motion

Respect user preferences for reduced motion:

```tsx
import { useReducedMotion } from 'framer-motion';

function AccessibleAnimation() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
      }}
    >
      Animated content
    </motion.div>
  );
}
```

### Network Optimization

#### API Request Batching

Batch multiple API requests:

```typescript
// Instead of multiple separate requests
async function fetchDataSeparately() {
  const hackerNews = await fetch('/api/hacker-news').then(res => res.json());
  const devTo = await fetch('/api/devto').then(res => res.json());
  const github = await fetch('/api/github').then(res => res.json());
  
  return { hackerNews, devTo, github };
}

// Batch requests into a single API call
async function fetchDataBatched() {
  const data = await fetch('/api/news-feed').then(res => res.json());
  
  return data; // { hackerNews, devTo, github }
}
```

#### Prefetching

Prefetch likely-to-be-needed resources:

```tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  
  // Prefetch on hover
  const handleMouseEnter = () => {
    router.prefetch(href);
  };
  
  return (
    <a href={href} onMouseEnter={handleMouseEnter}>
      {children}
    </a>
  );
}
```

### Performance Monitoring

#### Web Vitals Tracking

Track Web Vitals:

```typescript
// app/layout.tsx
import { useReportWebVitals } from 'next/web-vitals';

export function RootLayout({ children }: { children: React.ReactNode }) {
  useReportWebVitals(metric => {
    // Send to analytics
    console.log(metric);
    
    // Example: Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value * 1000) / 1000,
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });
  
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

#### Lighthouse CI

Set up Lighthouse CI to measure performance:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Start server
        run: npm run start & npx wait-on http://localhost:3000
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/search
          uploadArtifacts: true
          temporaryPublicStorage: true
          budgetPath: ./lighthouse-budget.json
```

## Performance Best Practices

### General Best Practices

1. **Measure First**: Establish performance baselines before optimizing
2. **Optimize Critical Rendering Path**: Focus on what users see first
3. **Lazy Load Non-Critical Resources**: Defer loading of below-the-fold content
4. **Minimize Main Thread Work**: Avoid long-running JavaScript tasks
5. **Optimize for Mobile**: Test and optimize for mobile devices first

### React-Specific Best Practices

1. **Use Production Builds**: Always use production builds in production
2. **Implement Code Splitting**: Split code by routes and components
3. **Virtualize Long Lists**: Use virtualization for long lists
4. **Memoize Components and Calculations**: Use memo, useMemo, and useCallback
5. **Avoid Unnecessary Re-renders**: Optimize component structure and state management

### Next.js-Specific Best Practices

1. **Use Server Components**: Leverage server components for data fetching
2. **Implement ISR**: Use Incremental Static Regeneration for semi-static data
3. **Optimize Images**: Use the Next.js Image component
4. **Configure Caching**: Set appropriate cache headers
5. **Use Dynamic Imports**: Implement code splitting with dynamic imports
