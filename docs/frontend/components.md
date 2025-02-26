# Component Library

This document outlines the component architecture for the HackerHome application, detailing the purpose, props, and usage of each reusable component.

## Component Organization

Components are organized into the following categories:

1. **UI Components**: Basic UI elements from ShadCN UI
2. **Layout Components**: Page layout and structural components
3. **Card Components**: Content cards for different sources
4. **Feature Components**: Components for specific features
5. **Animation Components**: Reusable animation components

## UI Components

These components are primarily from ShadCN UI with custom styling applied.

### Button

```tsx
import { Button } from "@/components/ui/button";

// Usage
<Button variant="default">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### Toggle

```tsx
import { Toggle } from "@/components/ui/toggle";

// Usage
<Toggle aria-label="Toggle italic">
  <Bold className="h-4 w-4" />
</Toggle>
```

### Switch

```tsx
import { Switch } from "@/components/ui/switch";

// Usage
<Switch checked={isChecked} onCheckedChange={setIsChecked} />
```

### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Usage
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
```

### Skeleton

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Usage
<Skeleton className="h-[200px] w-[200px] rounded-xl" />
```

## Layout Components

### AppLayout

The main layout component that wraps all pages.

```tsx
// src/components/layout/app-layout.tsx
import { AppLayout } from "@/components/layout/app-layout";

// Usage
<AppLayout>
  <Component {...pageProps} />
</AppLayout>
```

**Props:**
- `children`: React nodes to render inside the layout
- `mode`: 'simple' | 'advanced' - The current interface mode

### Header

The application header with navigation and mode toggle.

```tsx
// src/components/layout/header.tsx
import { Header } from "@/components/layout/header";

// Usage
<Header mode="simple" onModeToggle={() => setMode('advanced')} />
```

**Props:**
- `mode`: 'simple' | 'advanced' - The current interface mode
- `onModeToggle`: () => void - Function to toggle between simple and advanced modes

### SourcesPanel

Panel for managing news sources.

```tsx
// src/components/layout/sources-panel.tsx
import { SourcesPanel } from "@/components/layout/sources-panel";

// Usage
<SourcesPanel 
  sources={sources} 
  onToggleSource={handleToggleSource}
  onReorderSources={handleReorderSources}
/>
```

**Props:**
- `sources`: Source[] - Array of news sources
- `onToggleSource`: (sourceId: string) => void - Function to toggle a source on/off
- `onReorderSources`: (newOrder: string[]) => void - Function to reorder sources

## Card Components

### NewsCard

Card component for displaying news items.

```tsx
// src/components/cards/news-card.tsx
import { NewsCard } from "@/components/cards/news-card";

// Usage
<NewsCard 
  title="Article Title"
  source="Hacker News"
  url="https://example.com"
  points={100}
  commentCount={42}
  timestamp="2023-01-01T00:00:00Z"
  mode="simple"
/>
```

**Props:**
- `title`: string - The article title
- `source`: string - The source name (e.g., "Hacker News")
- `url`: string - The article URL
- `points`: number - The number of points/upvotes
- `commentCount`: number - The number of comments
- `timestamp`: string - ISO timestamp
- `mode`: 'simple' | 'advanced' - The current interface mode

### GithubCard

Card component for displaying GitHub repositories.

```tsx
// src/components/cards/github-card.tsx
import { GithubCard } from "@/components/cards/github-card";

// Usage
<GithubCard 
  name="repo-name"
  owner="owner-name"
  description="Repository description"
  stars={1000}
  forks={100}
  language="TypeScript"
  url="https://github.com/owner-name/repo-name"
  mode="simple"
/>
```

**Props:**
- `name`: string - Repository name
- `owner`: string - Repository owner
- `description`: string - Repository description
- `stars`: number - Star count
- `forks`: number - Fork count
- `language`: string - Primary language
- `url`: string - Repository URL
- `mode`: 'simple' | 'advanced' - The current interface mode

### DevToCard

Card component for displaying DEV.to articles.

```tsx
// src/components/cards/devto-card.tsx
import { DevToCard } from "@/components/cards/devto-card";

// Usage
<DevToCard 
  title="Article Title"
  author="Author Name"
  tags={["react", "typescript"]}
  reactions={42}
  url="https://dev.to/article"
  coverImage="https://example.com/image.jpg"
  readingTime={5}
  mode="simple"
/>
```

**Props:**
- `title`: string - Article title
- `author`: string - Author name
- `tags`: string[] - Article tags
- `reactions`: number - Reaction count
- `url`: string - Article URL
- `coverImage`: string - Cover image URL
- `readingTime`: number - Reading time in minutes
- `mode`: 'simple' | 'advanced' - The current interface mode

## Feature Components

### SearchBar

Component for searching across all sources.

```tsx
// src/components/features/search-bar.tsx
import { SearchBar } from "@/components/features/search-bar";

// Usage
<SearchBar onSearch={handleSearch} />
```

**Props:**
- `onSearch`: (query: string) => void - Function to handle search queries

### ThemeToggle

Component for toggling between light and dark themes.

```tsx
// src/components/features/theme-toggle.tsx
import { ThemeToggle } from "@/components/features/theme-toggle";

// Usage
<ThemeToggle />
```

### InfiniteScroll

Component for implementing infinite scrolling.

```tsx
// src/components/features/infinite-scroll.tsx
import { InfiniteScroll } from "@/components/features/infinite-scroll";

// Usage
<InfiniteScroll
  loadMore={loadMoreItems}
  hasMore={hasMoreItems}
  loader={<div>Loading...</div>}
>
  {items.map(item => (
    <NewsCard key={item.id} {...item} />
  ))}
</InfiniteScroll>
```

**Props:**
- `loadMore`: () => Promise<void> - Function to load more items
- `hasMore`: boolean - Whether there are more items to load
- `loader`: React.ReactNode - Loading indicator
- `children`: React.ReactNode - Content to render

## Animation Components

### FadeIn

Component for fade-in animations.

```tsx
// src/components/animations/fade-in.tsx
import { FadeIn } from "@/components/animations/fade-in";

// Usage
<FadeIn delay={0.2}>
  <div>Content to fade in</div>
</FadeIn>
```

**Props:**
- `children`: React.ReactNode - Content to animate
- `delay`: number - Delay before animation starts (in seconds)
- `duration`: number - Animation duration (in seconds)

### SlideIn

Component for slide-in animations.

```tsx
// src/components/animations/slide-in.tsx
import { SlideIn } from "@/components/animations/slide-in";

// Usage
<SlideIn direction="left" delay={0.2}>
  <div>Content to slide in</div>
</SlideIn>
```

**Props:**
- `children`: React.ReactNode - Content to animate
- `direction`: 'left' | 'right' | 'up' | 'down' - Direction to slide from
- `delay`: number - Delay before animation starts (in seconds)
- `duration`: number - Animation duration (in seconds)

### AnimatedList

Component for animating lists of items.

```tsx
// src/components/animations/animated-list.tsx
import { AnimatedList } from "@/components/animations/animated-list";

// Usage
<AnimatedList>
  {items.map(item => (
    <li key={item.id}>{item.name}</li>
  ))}
</AnimatedList>
```

**Props:**
- `children`: React.ReactNode[] - List items to animate
- `staggerDelay`: number - Delay between each item's animation (in seconds)

## Component Implementation Guidelines

### Component Structure

Each component should follow this structure:

```tsx
// Import statements
import React from 'react';
import { cn } from '@/lib/utils';

// Type definitions
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
}

// Component implementation
export function Button({
  className,
  variant = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-md px-4 py-2 font-medium transition-colors',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
        },
        className
      )}
      {...props}
    />
  );
}
```

### Best Practices

1. **Use TypeScript**: Define proper interfaces for all component props
2. **Implement Accessibility**: Ensure all components are accessible
3. **Support Both Modes**: Components should adapt to both simple and advanced modes
4. **Responsive Design**: All components should be responsive
5. **Performance**: Optimize components for performance (memoization, virtualization)
6. **Testing**: Write tests for all components

## Custom Hooks for Components

### useMediaQuery

```tsx
// src/lib/hooks/use-media-query.ts
import { useMediaQuery } from "@/lib/hooks/use-media-query";

// Usage
const isMobile = useMediaQuery("(max-width: 768px)");
```

### useIntersectionObserver

```tsx
// src/lib/hooks/use-intersection-observer.ts
import { useIntersectionObserver } from "@/lib/hooks/use-intersection-observer";

// Usage
const ref = useRef(null);
const isInView = useIntersectionObserver(ref, { threshold: 0.5 });
```

## Component Development Workflow

1. **Design**: Start with a clear design and requirements
2. **Implementation**: Implement the component with TypeScript and proper styling
3. **Testing**: Write tests for the component
4. **Documentation**: Document the component's props and usage
5. **Review**: Have the component reviewed by another developer
6. **Integration**: Integrate the component into the application