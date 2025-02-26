# Coding Standards

This document outlines the coding standards and best practices for the HackerHome application. Following these standards ensures code consistency, maintainability, and quality across the project.

## TypeScript Standards

### TypeScript Configuration

HackerHome uses strict TypeScript settings to ensure type safety:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Type Definitions

#### Prefer Interfaces Over Types

Use interfaces for object types that will be extended or implemented:

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// Avoid for objects
type User = {
  id: string;
  name: string;
  email: string;
};
```

Use types for unions, intersections, and simple aliases:

```typescript
// Good
type Status = 'pending' | 'approved' | 'rejected';
type UserOrAdmin = User | AdminUser;
type Coordinates = [number, number];
```

#### Explicit Function Types

Always define explicit return types for functions:

```typescript
// Good
function fetchUser(id: string): Promise<User> {
  // Implementation
}

// Avoid
function fetchUser(id: string) {
  // Implementation
}
```

#### Avoid Any

Avoid using `any` type. Use `unknown` when the type is truly unknown:

```typescript
// Good
function parseData(data: unknown): User {
  if (typeof data === 'object' && data !== null && 'id' in data) {
    return data as User;
  }
  throw new Error('Invalid data format');
}

// Avoid
function parseData(data: any): User {
  return data;
}
```

#### Use Type Guards

Create type guards to narrow types:

```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj
  );
}

function processEntity(entity: unknown): void {
  if (isUser(entity)) {
    // TypeScript knows entity is User here
    console.log(entity.name);
  }
}
```

### Naming Conventions

#### PascalCase

Use PascalCase for:
- Interfaces
- Types
- Classes
- Enums
- React components

```typescript
interface UserProfile {}
type ApiResponse = {}
class HttpClient {}
enum RequestStatus {}
function UserCard() {}
```

#### camelCase

Use camelCase for:
- Variables
- Functions
- Methods
- Properties

```typescript
const userData = {};
function fetchData() {}
const user = {
  firstName: 'John',
  getFullName() {}
};
```

#### UPPER_CASE

Use UPPER_CASE for constants:

```typescript
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;
```

## React Standards

### Component Structure

#### Functional Components

Use functional components with hooks:

```tsx
import React from 'react';

interface UserCardProps {
  user: User;
  onSelect: (user: User) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-medium">{user.name}</h3>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      <button
        className="mt-2 rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
        onClick={() => onSelect(user)}
      >
        Select
      </button>
    </div>
  );
}
```

#### Component File Structure

Organize component files in this order:

1. Imports
2. Types/Interfaces
3. Component function
4. Helper functions
5. Exports

```tsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

// 2. Types/Interfaces
interface ArticleProps {
  title: string;
  content: string;
  publishedAt: string;
}

// 3. Component function
export function Article({ title, content, publishedAt }: ArticleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Component logic
  
  return (
    <article>
      <h2>{title}</h2>
      <time>{formatDisplayDate(publishedAt)}</time>
      <div>{isExpanded ? content : truncateContent(content)}</div>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Show less' : 'Read more'}
      </button>
    </article>
  );
}

// 4. Helper functions
function truncateContent(content: string): string {
  return content.length > 200 ? `${content.slice(0, 200)}...` : content;
}

function formatDisplayDate(dateString: string): string {
  return formatDate(dateString, 'MMM d, yyyy');
}

// 5. Exports (if not using named exports above)
// export default Article;
```

### Client vs. Server Components

#### Server Components

Use server components for:
- Data fetching
- Access to backend resources
- Components that don't need interactivity
- Reducing client-side JavaScript

```tsx
// app/page.tsx
import { fetchArticles } from '@/lib/api';
import { ArticleList } from '@/components/article-list';

export default async function HomePage() {
  const articles = await fetchArticles();
  
  return (
    <main>
      <h1 className="text-3xl font-bold">Latest Articles</h1>
      <ArticleList articles={articles} />
    </main>
  );
}
```

#### Client Components

Use client components for:
- Interactive UI elements
- Event handlers
- State management
- Effects and lifecycle

```tsx
// components/article-list.tsx
'use client'

import { useState } from 'react';
import { Article } from '@/components/article';

interface ArticleListProps {
  articles: Article[];
}

export function ArticleList({ articles }: ArticleListProps) {
  const [filter, setFilter] = useState('all');
  
  const filteredArticles = articles.filter(article => {
    if (filter === 'all') return true;
    return article.category === filter;
  });
  
  return (
    <div>
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border p-2"
        >
          <option value="all">All Categories</option>
          <option value="tech">Tech</option>
          <option value="science">Science</option>
        </select>
      </div>
      
      <div className="space-y-4">
        {filteredArticles.map(article => (
          <Article key={article.id} {...article} />
        ))}
      </div>
    </div>
  );
}
```

### Hooks Usage

#### Custom Hooks

Extract reusable logic into custom hooks:

```typescript
// hooks/use-local-storage.ts
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

#### Hook Rules

Follow the Rules of Hooks:
- Only call hooks at the top level
- Only call hooks from React functions
- Use the `eslint-plugin-react-hooks` to enforce these rules

```typescript
// Good
function Component() {
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Rest of component
}

// Bad - conditional hook call
function Component() {
  if (condition) {
    const [state, setState] = useState(initialState);
  }
  
  // Rest of component
}
```

## File Organization

### Directory Structure

```
src/
├── app/                  # App Router pages and layouts
│   ├── (simple)/        # Simple mode routes
│   ├── (advanced)/      # Advanced mode routes
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # Reusable components
│   ├── ui/              # ShadCN UI components
│   ├── layout/          # Layout components
│   ├── cards/           # Card components for different sources
│   └── animations/      # Framer Motion animations
├── lib/                 # Utility functions and helpers
│   ├── api/             # API integration clients
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Utility functions
├── styles/              # Global styles
└── types/               # TypeScript type definitions
```

### File Naming Conventions

- **React Components**: PascalCase with `.tsx` extension
  - `Button.tsx`, `NewsCard.tsx`, `UserProfile.tsx`
- **Utility Files**: camelCase with `.ts` extension
  - `formatDate.ts`, `apiClient.ts`, `useLocalStorage.ts`
- **Page Files**: camelCase with `.tsx` extension
  - `page.tsx`, `layout.tsx`, `loading.tsx`
- **Test Files**: Same name as the file being tested with `.test.ts` or `.test.tsx` extension
  - `Button.test.tsx`, `formatDate.test.ts`

## Code Style

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:tailwindcss/recommended"
  ],
  "plugins": ["@typescript-eslint", "react-hooks", "tailwindcss"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "tailwindcss/no-custom-classname": "warn",
    "tailwindcss/classnames-order": "warn"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Import Order

Organize imports in this order:

1. React and Next.js imports
2. External libraries
3. Internal modules (using absolute paths)
4. Types and interfaces
5. CSS/SCSS imports

```typescript
// 1. React and Next.js imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. External libraries
import { motion } from 'framer-motion';
import { format } from 'date-fns';

// 3. Internal modules
import { Button } from '@/components/ui/button';
import { fetchArticles } from '@/lib/api';
import { formatDate } from '@/lib/utils';

// 4. Types and interfaces
import type { Article } from '@/types';

// 5. CSS/SCSS imports
import '@/styles/article.css';
```

## Performance Best Practices

### Memoization

Use memoization to prevent unnecessary re-renders:

```tsx
import React, { useMemo, useCallback } from 'react';

interface ExpensiveComponentProps {
  data: number[];
  onItemClick: (item: number) => void;
}

export function ExpensiveComponent({ data, onItemClick }: ExpensiveComponentProps) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => item * 2);
  }, [data]);
  
  // Memoize callback functions
  const handleItemClick = useCallback((item: number) => {
    console.log('Item clicked:', item);
    onItemClick(item);
  }, [onItemClick]);
  
  return (
    <ul>
      {processedData.map(item => (
        <li key={item} onClick={() => handleItemClick(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
}
```

### Code Splitting

Use dynamic imports for code splitting:

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

### Image Optimization

Use Next.js Image component for optimized images:

```tsx
import Image from 'next/image';

export function ProfileCard() {
  return (
    <div className="rounded-lg border p-4">
      <Image
        src="/profile.jpg"
        alt="User profile"
        width={100}
        height={100}
        className="rounded-full"
        priority={false}
        loading="lazy"
      />
      <h3 className="mt-2 text-lg font-medium">John Doe</h3>
    </div>
  );
}
```

## Error Handling

### API Error Handling

Handle API errors consistently:

```typescript
// lib/api/utils/error-handling.ts
export class ApiError extends Error {
  status: number;
  source: string;
  
  constructor({ status, message, source }: { status: number; message: string; source: string }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.source = source;
  }
}

export function handleApiError(error: unknown, source: string): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  
  return new ApiError({
    status: 0,
    message: error instanceof Error ? error.message : String(error),
    source,
  });
}

// Usage in API client
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new ApiError({
        status: response.status,
        message: `API request failed with status ${response.status}`,
        source: 'data-api',
      });
    }
    
    return await response.json();
  } catch (error) {
    throw handleApiError(error, 'data-api');
  }
}
```

### Error Boundaries

Use error boundaries to catch and handle errors:

```tsx
// components/error-boundary.tsx
'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    // You can also log to an error reporting service here
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## Testing Standards

### Unit Testing

Use Jest and React Testing Library for unit tests:

```tsx
// components/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
  
  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('applies variant class correctly', () => {
    render(<Button variant="outline">Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toHaveClass('border-input');
    expect(button).toHaveClass('bg-background');
  });
});
```

### Integration Testing

Test component interactions:

```tsx
// features/search.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchFeature } from './search-feature';
import { fetchSearchResults } from '@/lib/api';

// Mock API
jest.mock('@/lib/api', () => ({
  fetchSearchResults: jest.fn(),
}));

describe('SearchFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('searches and displays results', async () => {
    // Mock API response
    (fetchSearchResults as jest.Mock).mockResolvedValue([
      { id: '1', title: 'Result 1' },
      { id: '2', title: 'Result 2' },
    ]);
    
    render(<SearchFeature />);
    
    // Type in search box
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'test query' },
    });
    
    // Click search button
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    // Check API was called
    expect(fetchSearchResults).toHaveBeenCalledWith('test query');
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Result 1')).toBeInTheDocument();
      expect(screen.getByText('Result 2')).toBeInTheDocument();
    });
  });
  
  test('shows error message when search fails', async () => {
    // Mock API error
    (fetchSearchResults as jest.Mock).mockRejectedValue(new Error('Search failed'));
    
    render(<SearchFeature />);
    
    // Type and search
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'test query' },
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Testing

Use Playwright for end-to-end testing:

```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test('search functionality', async ({ page }) => {
  // Navigate to the page
  await page.goto('/');
  
  // Fill the search input
  await page.fill('[placeholder="Search..."]', 'react');
  
  // Click the search button
  await page.click('button:has-text("Search")');
  
  // Wait for results to load
  await page.waitForSelector('.search-results');
  
  // Check that results are displayed
  const results = await page.$$('.search-result');
  expect(results.length).toBeGreaterThan(0);
  
  // Check that results contain the search term
  const firstResultText = await results[0].textContent();
  expect(firstResultText?.toLowerCase()).toContain('react');
});
```

## Documentation Standards

### Code Comments

Use JSDoc comments for functions and components:

```typescript
/**
 * Formats a date string into a human-readable format
 * 
 * @param dateString - ISO date string to format
 * @param formatString - Format string (default: 'PP')
 * @returns Formatted date string
 * 
 * @example
 * ```ts
 * formatDate('2023-01-01T00:00:00Z')
 * // Returns: 'Jan 1, 2023'
 * ```
 */
export function formatDate(dateString: string, formatString: string = 'PP'): string {
  return format(new Date(dateString), formatString);
}
```

Use inline comments sparingly and only for complex logic:

```typescript
function calculateTotalScore(scores: number[]): number {
  // Remove the lowest and highest scores
  const sortedScores = [...scores].sort((a, b) => a - b);
  const filteredScores = sortedScores.slice(1, -1);
  
  // Calculate the average of remaining scores
  return filteredScores.reduce((sum, score) => sum + score, 0) / filteredScores.length;
}
```

### README Files

Include README files in major directories:

```markdown
# API Integration

This directory contains API clients for integrating with external services.

## Files

- `hacker-news.ts` - Client for Hacker News API
- `devto.ts` - Client for DEV.to API
- `github.ts` - Client for GitHub API
- `utils/` - Shared utilities for API clients

## Usage

```typescript
import { fetchTopStories } from './hacker-news';

// Fetch top stories
const stories = await fetchTopStories();
```
```

## Git Standards

### Commit Messages

Follow the Conventional Commits specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that don't affect code functionality (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to the build process, tools, etc.

Examples:
```
feat(news-card): add support for comment count

fix(api): handle rate limiting in GitHub API

docs: update README with setup instructions
```

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent fixes for production
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test-related changes

Examples:
```
feature/news-card-redesign
bugfix/api-error-handling
docs/update-readme
```

## Security Best Practices

### Environment Variables

Store sensitive information in environment variables:

```typescript
// .env.local
API_KEY=your_secret_api_key

// Usage
const apiKey = process.env.API_KEY;
```

### Input Validation

Validate all user inputs:

```typescript
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

// Validate input
function createUser(input: unknown) {
  try {
    const user = UserSchema.parse(input);
    // Proceed with validated data
    return user;
  } catch (error) {
    // Handle validation error
    console.error('Invalid user data:', error);
    throw new Error('Invalid user data');
  }
}
```

### XSS Prevention

Prevent XSS attacks:

- Use React's built-in XSS protection
- Sanitize HTML content when needed
- Use Content Security Policy headers

```typescript
import DOMPurify from 'dompurify';

function SafeHTML({ html }: { html: string }) {
  const sanitizedHTML = DOMPurify.sanitize(html);
  
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
}
```

## Accessibility Standards

### Semantic HTML

Use semantic HTML elements:

```tsx
// Good
<article>
  <h2>Article Title</h2>
  <p>Article content...</p>
  <footer>
    <time>Published: January 1, 2023</time>
  </footer>
</article>

// Avoid
<div class="article">
  <div class="title">Article Title</div>
  <div class="content">Article content...</div>
  <div class="footer">
    <div>Published: January 1, 2023</div>
  </div>
</div>
```

### ARIA Attributes

Use ARIA attributes when necessary:

```tsx
<button
  aria-expanded={isExpanded}
  aria-controls="content-panel"
  onClick={() => setIsExpanded(!isExpanded)}
>
  {isExpanded ? 'Collapse' : 'Expand'}
</button>

<div
  id="content-panel"
  aria-hidden={!isExpanded}
  className={isExpanded ? 'visible' : 'hidden'}
>
  Content here...
</div>
```

### Keyboard Navigation

Ensure keyboard navigation works:

```tsx
function KeyboardNavigableMenu() {
  const [activeIndex, setActiveIndex] = useState(0);
  const menuItems = ['Home', 'About', 'Contact'];
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % menuItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
        break;
      case 'Enter':
        e.preventDefault();
        // Activate the current item
        console.log(`Activated: ${menuItems[activeIndex]}`);
        break;
    }
  };
  
  return (
    <ul
      role="menu"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="focus:outline-none focus:ring-2"
    >
      {menuItems.map((item, index) => (
        <li
          key={item}
          role="menuitem"
          tabIndex={-1}
          className={`p-2 ${index === activeIndex ? 'bg-accent' : ''}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}