# Testing Strategy

This document outlines the testing strategy for the HackerHome application, detailing the approach, tools, and best practices for ensuring code quality and reliability.

## Testing Philosophy

HackerHome follows a comprehensive testing approach that emphasizes:

1. **Early Testing**: Write tests early in the development process
2. **Test Pyramid**: Balance unit, integration, and end-to-end tests
3. **Automation**: Automate tests to run in CI/CD pipelines
4. **Coverage**: Aim for high test coverage of critical paths
5. **Maintainability**: Write maintainable tests that don't break with minor changes

## Test Types

### Unit Tests

Unit tests verify that individual components and functions work as expected in isolation.

**Focus Areas:**
- Utility functions
- Custom hooks
- UI components
- State management logic
- API client functions

**Tools:**
- Jest
- React Testing Library
- @testing-library/hooks

#### Example Unit Test for a Component

```tsx
// src/components/ui/button.test.tsx
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

#### Example Unit Test for a Utility Function

```typescript
// src/lib/utils/format-date.test.ts
import { formatDate } from './format-date';

describe('formatDate', () => {
  test('formats ISO date string to readable format', () => {
    const isoDate = '2023-01-15T12:30:45Z';
    const result = formatDate(isoDate);
    
    expect(result).toBe('Jan 15, 2023');
  });
  
  test('accepts custom format string', () => {
    const isoDate = '2023-01-15T12:30:45Z';
    const result = formatDate(isoDate, 'yyyy/MM/dd');
    
    expect(result).toBe('2023/01/15');
  });
  
  test('handles invalid date gracefully', () => {
    const invalidDate = 'not-a-date';
    
    expect(() => formatDate(invalidDate)).toThrow();
  });
});
```

#### Example Unit Test for a Custom Hook

```typescript
// src/lib/hooks/use-local-storage.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useLocalStorage } from './use-local-storage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
    
    // Mock localStorage
    jest.spyOn(window.localStorage, 'getItem');
    jest.spyOn(window.localStorage, 'setItem');
  });
  
  test('returns initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('initial');
    expect(window.localStorage.getItem).toHaveBeenCalledWith('test-key');
  });
  
  test('returns stored value when it exists', () => {
    window.localStorage.setItem('test-key', JSON.stringify('stored value'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('stored value');
  });
  
  test('updates value and localStorage when setter is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('new value');
    });
    
    expect(result.current[0]).toBe('new value');
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify('new value')
    );
  });
});
```

### Integration Tests

Integration tests verify that multiple components or functions work together correctly.

**Focus Areas:**
- Component compositions
- Page layouts
- Form submissions
- API integration
- State management across components

**Tools:**
- Jest
- React Testing Library
- MSW (Mock Service Worker)

#### Example Integration Test for a Feature

```tsx
// src/features/search/search-feature.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SearchFeature } from './search-feature';

// Mock API server
const server = setupServer(
  rest.get('/api/search', (req, res, ctx) => {
    const query = req.url.searchParams.get('q');
    
    if (query === 'react') {
      return res(
        ctx.json([
          { id: '1', title: 'React Hooks Tutorial', source: 'devto' },
          { id: '2', title: 'React Performance Tips', source: 'hackernews' },
        ])
      );
    }
    
    return res(ctx.json([]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('SearchFeature', () => {
  test('searches and displays results', async () => {
    render(<SearchFeature />);
    
    // Type in search box
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'react' },
    });
    
    // Click search button
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('React Hooks Tutorial')).toBeInTheDocument();
      expect(screen.getByText('React Performance Tips')).toBeInTheDocument();
    });
  });
  
  test('shows empty state when no results found', async () => {
    render(<SearchFeature />);
    
    // Type in search box
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'nonexistent' },
    });
    
    // Click search button
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    // Wait for empty state to appear
    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });
  
  test('shows error state when API fails', async () => {
    // Override the handler to simulate an error
    server.use(
      rest.get('/api/search', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    render(<SearchFeature />);
    
    // Type and search
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'react' },
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

#### Example Integration Test for a Page

```tsx
// src/app/(simple)/page.test.tsx
import { render, screen } from '@testing-library/react';
import HomePage from './page';
import { fetchTopStories } from '@/lib/api/hacker-news';
import { fetchArticles } from '@/lib/api/devto';
import { fetchTrendingRepositories } from '@/lib/api/github';

// Mock API functions
jest.mock('@/lib/api/hacker-news');
jest.mock('@/lib/api/devto');
jest.mock('@/lib/api/github');

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    (fetchTopStories as jest.Mock).mockResolvedValue([
      { id: '1', title: 'HN Story', source: 'hackernews', timestamp: '2023-01-01T00:00:00Z' },
    ]);
    
    (fetchArticles as jest.Mock).mockResolvedValue([
      { id: '2', title: 'DEV Article', source: 'devto', timestamp: '2023-01-02T00:00:00Z' },
    ]);
    
    (fetchTrendingRepositories as jest.Mock).mockResolvedValue([
      { id: '3', name: 'repo', owner: 'user', source: 'github', timestamp: '2023-01-03T00:00:00Z' },
    ]);
  });
  
  test('renders news feed with items from all sources', async () => {
    render(await HomePage());
    
    // Check that items from all sources are rendered
    expect(screen.getByText('HN Story')).toBeInTheDocument();
    expect(screen.getByText('DEV Article')).toBeInTheDocument();
    expect(screen.getByText('user/repo')).toBeInTheDocument();
  });
  
  test('renders correctly when an API fails', async () => {
    // Simulate one API failing
    (fetchDevToArticles as jest.Mock).mockRejectedValue(new Error('API error'));
    
    render(await HomePage());
    
    // Should still render items from other sources
    expect(screen.getByText('HN Story')).toBeInTheDocument();
    expect(screen.getByText('user/repo')).toBeInTheDocument();
    
    // Should show error for failed source
    expect(screen.getByText(/error loading devto/i)).toBeInTheDocument();
  });
});
```

### End-to-End Tests

End-to-end tests verify that the entire application works correctly from a user's perspective.

**Focus Areas:**
- Critical user flows
- Cross-page navigation
- Authentication flows
- Responsive design
- Performance metrics

**Tools:**
- Playwright
- Cypress

#### Example E2E Test with Playwright

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

test('theme toggle', async ({ page }) => {
  // Navigate to the page
  await page.goto('/');
  
  // Check initial theme
  expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBeFalsy();
  
  // Click theme toggle button
  await page.click('button[aria-label="Toggle theme"]');
  
  // Check that theme changed to dark
  expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBeTruthy();
  
  // Click theme toggle button again
  await page.click('button[aria-label="Toggle theme"]');
  
  // Check that theme changed back to light
  expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBeFalsy();
});

test('infinite scrolling', async ({ page }) => {
  // Navigate to the page
  await page.goto('/');
  
  // Get initial number of items
  const initialItemCount = await page.$$eval('.news-card', items => items.length);
  
  // Scroll to bottom of page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  // Wait for more items to load
  await page.waitForFunction(
    (initialCount) => document.querySelectorAll('.news-card').length > initialCount,
    initialItemCount
  );
  
  // Check that more items were loaded
  const newItemCount = await page.$$eval('.news-card', items => items.length);
  expect(newItemCount).toBeGreaterThan(initialItemCount);
});
```

### Visual Regression Tests

Visual regression tests verify that UI components and pages maintain their visual appearance.

**Focus Areas:**
- Component styling
- Layout consistency
- Theme switching
- Responsive design

**Tools:**
- Playwright
- Storybook
- Percy

#### Example Visual Regression Test with Playwright

```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test('homepage visual regression', async ({ page }) => {
  // Navigate to the page
  await page.goto('/');
  
  // Wait for content to load
  await page.waitForSelector('.news-card');
  
  // Take a screenshot and compare with baseline
  await expect(page).toHaveScreenshot('homepage.png');
});

test('dark mode visual regression', async ({ page }) => {
  // Navigate to the page
  await page.goto('/');
  
  // Switch to dark mode
  await page.click('button[aria-label="Toggle theme"]');
  
  // Wait for theme to apply
  await page.waitForSelector('html.dark');
  
  // Take a screenshot and compare with baseline
  await expect(page).toHaveScreenshot('homepage-dark.png');
});

test('mobile layout visual regression', async ({ page }) => {
  // Set viewport to mobile size
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Navigate to the page
  await page.goto('/');
  
  // Wait for content to load
  await page.waitForSelector('.news-card');
  
  // Take a screenshot and compare with baseline
  await expect(page).toHaveScreenshot('homepage-mobile.png');
});
```

### Accessibility Tests

Accessibility tests verify that the application is accessible to all users.

**Focus Areas:**
- ARIA attributes
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management

**Tools:**
- axe-core
- Playwright Accessibility
- eslint-plugin-jsx-a11y

#### Example Accessibility Test with Playwright and axe-core

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage should not have accessibility violations', async ({ page }) => {
  // Navigate to the page
  await page.goto('/');
  
  // Wait for content to load
  await page.waitForSelector('.news-card');
  
  // Run axe
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  // Assert no violations
  expect(accessibilityScanResults.violations).toEqual([]);
});

test('keyboard navigation works correctly', async ({ page }) => {
  // Navigate to the page
  await page.goto('/');
  
  // Focus the search input with keyboard
  await page.keyboard.press('Tab');
  
  // Check that search input is focused
  await expect(page.locator('[placeholder="Search..."]')).toBeFocused();
  
  // Navigate to search button
  await page.keyboard.press('Tab');
  
  // Check that search button is focused
  await expect(page.locator('button:has-text("Search")')).toBeFocused();
  
  // Press the button
  await page.keyboard.press('Enter');
  
  // Check that search was triggered
  await expect(page.locator('.search-results')).toBeVisible();
});
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config
module.exports = createJestConfig(customJestConfig);
```

### Jest Setup

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { setProjectAnnotations } from '@storybook/react';
import * as globalStorybookConfig from './.storybook/preview';

// Make Storybook annotations available in tests
setProjectAnnotations(globalStorybookConfig);

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    return null;
  }
  
  unobserve() {
    return null;
  }
  
  disconnect() {
    return null;
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});
```

### Playwright Configuration

```javascript
// playwright.config.ts
import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
};

export default config;
```

## Test Coverage

### Coverage Goals

- **Unit Tests**: 80% coverage of utility functions and hooks
- **Component Tests**: 70% coverage of UI components
- **Integration Tests**: Cover all critical user flows
- **E2E Tests**: Cover all major features and user journeys

### Coverage Reporting

Generate coverage reports with Jest:

```bash
npm run test:coverage
```

This will generate a coverage report in the `coverage` directory.

## Test Organization

### Directory Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── button.test.tsx
│   │   └── button.stories.tsx
│   └── ...
├── lib/
│   ├── utils/
│   │   ├── format-date.ts
│   │   └── format-date.test.ts
│   └── ...
└── ...
e2e/
├── search.spec.ts
├── navigation.spec.ts
└── ...
```

### Naming Conventions

- **Unit Tests**: `*.test.ts` or `*.test.tsx`
- **Integration Tests**: `*.test.ts` or `*.test.tsx`
- **E2E Tests**: `*.spec.ts`
- **Visual Tests**: `*.visual.spec.ts`
- **Accessibility Tests**: `*.a11y.spec.ts`

## Testing in CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
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
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Unit and integration tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Build
        run: npm run build
      
      - name: Start server
        run: npm run start & npx wait-on http://localhost:3000
      
      - name: E2E tests
        run: npm run test:e2e
      
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Test Best Practices

### General Best Practices

1. **Write Tests First**: Follow Test-Driven Development (TDD) when possible
2. **Keep Tests Simple**: Each test should verify one specific behavior
3. **Use Descriptive Names**: Test names should describe what is being tested
4. **Avoid Test Interdependence**: Tests should not depend on each other
5. **Clean Up After Tests**: Reset state between tests

### React Testing Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Screen Queries**: Prefer screen queries over container queries
3. **Use User-Event**: Use user-event for simulating user interactions
4. **Test Accessibility**: Verify that components are accessible
5. **Mock External Dependencies**: Use mocks for API calls and external services

### Example of Good Test

```tsx
// Good test example
test('submits form with user data when submit button is clicked', async () => {
  // Arrange
  const handleSubmit = jest.fn();
  render(<UserForm onSubmit={handleSubmit} />);
  
  // Act
  await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
  await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  // Assert
  expect(handleSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com',
  });
});
```

### Example of Bad Test

```tsx
// Bad test example
test('form works', () => {
  // Too vague, tests too many things at once
  const { container } = render(<UserForm />);
  
  // Using container queries instead of screen queries
  const nameInput = container.querySelector('input[name="name"]');
  const emailInput = container.querySelector('input[name="email"]');
  const submitButton = container.querySelector('button[type="submit"]');
  
  // Direct DOM manipulation instead of user-event
  fireEvent.change(nameInput, { target: { value: 'John Doe' } });
  fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
  fireEvent.click(submitButton);
  
  // Testing implementation details
  expect(nameInput.value).toBe('John Doe');
  expect(emailInput.value).toBe('john@example.com');
  expect(container.querySelector('.success-message')).toBeInTheDocument();
});
```

## Mocking Strategies

### API Mocking

Use MSW (Mock Service Worker) to mock API calls:

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/hacker-news', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          title: 'Test HN Story',
          url: 'https://example.com',
          source: 'hackernews',
          points: 100,
          commentCount: 42,
          timestamp: '2023-01-01T00:00:00Z',
        },
      ])
    );
  }),
  
  rest.get('/api/devto', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '2',
          title: 'Test DEV Article',
          url: 'https://dev.to/example',
          source: 'devto',
          commentCount: 10,
          timestamp: '2023-01-02T00:00:00Z',
        },
      ])
    );
  }),
  
  // Add more handlers as needed
];
```

### Module Mocking

Mock modules with Jest:

```typescript
// Mock a module
jest.mock('@/lib/api/hacker-news', () => ({
  fetchTopStories: jest.fn().mockResolvedValue([
    {
      id: '1',
      title: 'Test HN Story',
      url: 'https://example.com',
      source: 'hackernews',
      points: 100,
      commentCount: 42,
      timestamp: '2023-01-01T00:00:00Z',
    },
  ]),
}));
```

### Component Mocking

Mock components when testing parent components:

```tsx
// Mock a component
jest.mock('@/components/news-card', () => ({
  NewsCard: ({ title }: { title: string }) => <div data-testid="mocked-news-card">{title}</div>,
}));
```

## Debugging Tests

### Jest Debugging

Use the `debug` function from React Testing Library:

```tsx
test('component renders correctly', () => {
  render(<MyComponent />);
  screen.debug(); // Prints the current DOM to console
});
```

### Playwright Debugging

Use Playwright's debugging tools:

```typescript
// Pause test execution and open inspector
await page.pause();

// Take a screenshot
await page.screenshot({ path: 'debug-screenshot.png' });

// Record a video
test.use({ video: { mode: 'on' } });
```

## Performance Testing

### Lighthouse CI

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

### Web Vitals Monitoring

Monitor Web Vitals in production:

```typescript
// src/app/layout.tsx
import { useReportWebVitals } from 'next/web-vitals';

export function RootLayout({ children }: { children: React.ReactNode }) {
  useReportWebVitals(metric => {
    // Send to analytics
    console.log(metric);
  });
  
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Continuous Improvement

### Test Review Process

1. **Code Review**: Include test review in the code review process
2. **Test Quality**: Evaluate test quality and coverage
3. **Test Maintenance**: Regularly update and improve tests
4. **Test Metrics**: Track test metrics (coverage, run time, flakiness)

### Test Refactoring

Refactor tests when:
- Tests are slow
- Tests are flaky
- Tests are difficult to understand
- Tests break with minor changes

### Learning Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing JavaScript](https://testingjavascript.com/) by Kent C. Dodds