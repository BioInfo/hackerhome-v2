# State Management

This document outlines the state management approach for the HackerHome application, detailing the strategies, patterns, and tools used to manage application state.

## State Management Philosophy

HackerHome follows a pragmatic approach to state management, using the right tool for each specific state category:

1. **Server State**: Data fetched from APIs
2. **UI State**: Visual state of the interface
3. **User Preferences**: User-specific settings
4. **Application State**: Cross-cutting application state

## State Categories

### Server State

Server state represents data fetched from external APIs:

- News items from Hacker News, DEV.to, GitHub, etc.
- User interactions with that data (e.g., read status)
- Pagination and loading states

### UI State

UI state represents the visual state of the interface:

- Modal open/closed states
- Active tabs or selected items
- Form input values
- Animation states

### User Preferences

User preferences represent user-specific settings:

- Theme preference (light/dark)
- Interface mode (simple/advanced)
- Enabled/disabled sources
- Source order

### Application State

Application state represents cross-cutting concerns:

- Authentication state
- Global notifications
- Feature flags
- Cross-component coordination

## State Management Tools

### React Query / SWR

For server state management, we use [SWR](https://swr.vercel.app/) (Stale-While-Revalidate):

```tsx
// src/lib/hooks/use-news-feed.ts
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { fetchHackerNews } from '@/lib/api/hacker-news'

export function useHackerNewsFeed(pageSize = 10) {
  const getKey = (pageIndex: number, previousPageData: any[]) => {
    if (previousPageData && !previousPageData.length) return null
    return [`/api/hacker-news`, pageIndex, pageSize]
  }

  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    getKey,
    async ([_, pageIndex, pageSize]) => {
      return fetchHackerNews(pageIndex, pageSize)
    },
    {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
      persistSize: true,
      dedupingInterval: 300000, // 5 minutes (as specified in PRD)
    }
  )

  const items = data ? data.flat() : []
  const isLoading = !data && !error
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = data?.[0]?.length === 0
  const hasMore = !isEmpty && data && data[data.length - 1]?.length === pageSize

  return {
    items,
    error,
    isLoading,
    isLoadingMore,
    loadMore: () => setSize(size + 1),
    hasMore,
    isValidating,
  }
}
```

### React Context

For UI state and user preferences that need to be accessed by multiple components:

```tsx
// src/lib/context/app-context.tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Mode = 'simple' | 'advanced'
type Source = {
  id: string
  name: string
  enabled: boolean
  order: number
}

interface AppContextType {
  mode: Mode
  setMode: (mode: Mode) => void
  sources: Source[]
  toggleSource: (sourceId: string) => void
  reorderSources: (newOrder: string[]) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('simple')
  const [sources, setSources] = useState<Source[]>([
    { id: 'hackernews', name: 'Hacker News', enabled: true, order: 0 },
    { id: 'devto', name: 'DEV.to', enabled: true, order: 1 },
    { id: 'github', name: 'GitHub', enabled: true, order: 2 },
    { id: 'producthunt', name: 'Product Hunt', enabled: false, order: 3 },
    { id: 'medium', name: 'Medium', enabled: false, order: 4 },
  ])

  // Load preferences from localStorage on mount
  useEffect(() => {
    const storedMode = localStorage.getItem('hackerhome-mode')
    if (storedMode === 'simple' || storedMode === 'advanced') {
      setMode(storedMode)
    }

    const storedSources = localStorage.getItem('hackerhome-sources')
    if (storedSources) {
      try {
        setSources(JSON.parse(storedSources))
      } catch (e) {
        console.error('Failed to parse stored sources', e)
      }
    }
  }, [])

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('hackerhome-mode', mode)
  }, [mode])

  useEffect(() => {
    localStorage.setItem('hackerhome-sources', JSON.stringify(sources))
  }, [sources])

  const toggleSource = (sourceId: string) => {
    setSources(prevSources =>
      prevSources.map(source =>
        source.id === sourceId
          ? { ...source, enabled: !source.enabled }
          : source
      )
    )
  }

  const reorderSources = (newOrder: string[]) => {
    setSources(prevSources => {
      const sourceMap = new Map(prevSources.map(source => [source.id, source]))
      return newOrder.map((id, index) => {
        const source = sourceMap.get(id)
        if (!source) throw new Error(`Source with id ${id} not found`)
        return { ...source, order: index }
      })
    })
  }

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        sources,
        toggleSource,
        reorderSources,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
```

### Zustand

For more complex application state that requires fine-grained control:

```tsx
// src/lib/store/use-app-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Mode = 'simple' | 'advanced'
type Source = {
  id: string
  name: string
  enabled: boolean
  order: number
}
type Notification = {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

interface AppState {
  // User preferences
  mode: Mode
  setMode: (mode: Mode) => void
  
  // Sources management
  sources: Source[]
  toggleSource: (sourceId: string) => void
  reorderSources: (newOrder: string[]) => void
  
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User preferences
      mode: 'simple',
      setMode: (mode) => set({ mode }),
      
      // Sources management
      sources: [
        { id: 'hackernews', name: 'Hacker News', enabled: true, order: 0 },
        { id: 'devto', name: 'DEV.to', enabled: true, order: 1 },
        { id: 'github', name: 'GitHub', enabled: true, order: 2 },
        { id: 'producthunt', name: 'Product Hunt', enabled: false, order: 3 },
        { id: 'medium', name: 'Medium', enabled: false, order: 4 },
      ],
      toggleSource: (sourceId) => set((state) => ({
        sources: state.sources.map(source =>
          source.id === sourceId
            ? { ...source, enabled: !source.enabled }
            : source
        )
      })),
      reorderSources: (newOrder) => set((state) => {
        const sourceMap = new Map(state.sources.map(source => [source.id, source]))
        return {
          sources: newOrder.map((id, index) => {
            const source = sourceMap.get(id)
            if (!source) throw new Error(`Source with id ${id} not found`)
            return { ...source, order: index }
          })
        }
      }),
      
      // Search
      searchQuery: '',
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      
      // Notifications
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [
          ...state.notifications,
          { ...notification, id: Date.now().toString() }
        ]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification.id !== id
        )
      })),
    }),
    {
      name: 'hackerhome-storage',
      partialize: (state) => ({
        mode: state.mode,
        sources: state.sources,
      }),
    }
  )
)
```

### React useState and useReducer

For local component state:

```tsx
// src/components/features/search-bar.tsx
'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useAppStore } from '@/lib/store/use-app-store'

export function SearchBar() {
  const [inputValue, setInputValue] = useState('')
  const debouncedValue = useDebounce(inputValue, 300)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  
  useEffect(() => {
    setSearchQuery(debouncedValue)
  }, [debouncedValue, setSearchQuery])
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search..."
        className="pl-10"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </div>
  )
}
```

## State Management Patterns

### Custom Hooks

Encapsulate state logic in custom hooks:

```tsx
// src/lib/hooks/use-local-storage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })
  
  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }
  
  // Update stored value if the key changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    
    try {
      const item = window.localStorage.getItem(key)
      setStoredValue(item ? JSON.parse(item) : initialValue)
    } catch (error) {
      console.error(error)
      setStoredValue(initialValue)
    }
  }, [key, initialValue])
  
  return [storedValue, setValue] as const
}
```

### Selector Pattern

Use selectors to access specific parts of state:

```tsx
// Using Zustand selectors
const mode = useAppStore((state) => state.mode)
const setMode = useAppStore((state) => state.setMode)
const enabledSources = useAppStore((state) => 
  state.sources.filter(source => source.enabled)
)
```

### Compound Components

Use compound components to share state between related components:

```tsx
// src/components/features/tabs.tsx
'use client'

import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

function Tabs({ 
  defaultTab, 
  children 
}: { 
  defaultTab: string
  children: React.ReactNode 
}) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  )
}

function TabsList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex space-x-1 rounded-lg bg-muted p-1">
      {children}
    </div>
  )
}

function TabsTrigger({ 
  value, 
  children 
}: { 
  value: string
  children: React.ReactNode 
}) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component')
  }
  
  const { activeTab, setActiveTab } = context
  
  return (
    <button
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        activeTab === value
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
      )}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

function TabsContent({ 
  value, 
  children 
}: { 
  value: string
  children: React.ReactNode 
}) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component')
  }
  
  const { activeTab } = context
  
  if (activeTab !== value) {
    return null
  }
  
  return <div>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

## Data Fetching and Caching

### SWR Configuration

Configure SWR for optimal data fetching and caching:

```tsx
// src/lib/swr-config.tsx
'use client'

import { SWRConfig } from 'swr'

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
  )
}
```

### API Client Integration

Integrate API clients with state management:

```tsx
// src/lib/api/api-client.ts
const API_CACHE_DURATION = 300000 // 5 minutes (as specified in PRD)

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()

export async function fetchWithCache<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options)}`
  const now = Date.now()
  
  // Check cache
  const cached = cache.get(cacheKey)
  if (cached && now - cached.timestamp < API_CACHE_DURATION) {
    return cached.data as T
  }
  
  // Fetch fresh data
  const response = await fetch(url, options)
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  // Update cache
  cache.set(cacheKey, { data, timestamp: now })
  
  return data as T
}
```

## State Synchronization

### Local Storage Synchronization

Synchronize state with local storage:

```tsx
// src/lib/hooks/use-sync-local-storage.ts
import { useEffect } from 'react'

export function useSyncLocalStorage<T>(key: string, value: T) {
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving to localStorage: ${error}`)
    }
  }, [key, value])
}
```

### URL State Synchronization

Synchronize state with URL parameters:

```tsx
// src/lib/hooks/use-url-state.ts
import { useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function useUrlState<T extends string | string[]>(
  param: string,
  defaultValue: T
): [T, (value: T) => void] {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Get the current value from URL
  const getValue = useCallback(() => {
    const paramValue = searchParams.get(param)
    
    if (Array.isArray(defaultValue)) {
      return paramValue ? paramValue.split(',') : defaultValue
    }
    
    return (paramValue as T) || defaultValue
  }, [searchParams, param, defaultValue])
  
  // Set the value in URL
  const setValue = useCallback(
    (value: T) => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(param, value.join(','))
        } else {
          params.delete(param)
        }
      } else if (value) {
        params.set(param, value)
      } else {
        params.delete(param)
      }
      
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams, param]
  )
  
  return [getValue(), setValue]
}
```

## State Management Best Practices

### Colocation

Keep state as close as possible to where it's used:

- Use local component state for UI elements that don't need to be shared
- Use context for state that needs to be shared among a subtree of components
- Use global state only for truly global concerns

### Immutability

Always update state immutably:

```tsx
// Good - immutable update
setItems(prevItems => [...prevItems, newItem])

// Bad - mutating state directly
items.push(newItem) // Don't do this!
```

### Derived State

Compute derived state rather than storing it:

```tsx
// Good - compute derived state
const enabledSources = sources.filter(source => source.enabled)

// Bad - store derived state
const [enabledSources, setEnabledSources] = useState([])
// Now you have to keep this in sync with sources
```

### State Initialization

Initialize state with meaningful defaults:

```tsx
// Good - meaningful default
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

// Bad - undefined default
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>()
```

### Error Handling

Handle errors gracefully in state:

```tsx
// src/lib/hooks/use-safe-state.ts
import { useState } from 'react'

export function useSafeState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState)
  const [error, setError] = useState<Error | null>(null)
  
  const setSafeState = (updater: T | ((prevState: T) => T)) => {
    try {
      setState(updater)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    }
  }
  
  return [state, setSafeState, error] as const
}
```

## Testing State Management

### Unit Testing

Test state logic in isolation:

```tsx
// src/lib/store/use-app-store.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAppStore } from './use-app-store'

describe('useAppStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    act(() => {
      useAppStore.setState({
        mode: 'simple',
        sources: [
          { id: 'hackernews', name: 'Hacker News', enabled: true, order: 0 },
          { id: 'devto', name: 'DEV.to', enabled: true, order: 1 },
        ],
        // ... other initial state
      })
    })
  })
  
  test('should toggle source enabled state', () => {
    const { result } = renderHook(() => useAppStore())
    
    act(() => {
      result.current.toggleSource('hackernews')
    })
    
    expect(result.current.sources[0].enabled).toBe(false)
    
    act(() => {
      result.current.toggleSource('hackernews')
    })
    
    expect(result.current.sources[0].enabled).toBe(true)
  })
  
  // More tests...
})
```

### Integration Testing

Test state management with components:

```tsx
// src/components/features/search-bar.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SearchBar } from './search-bar'
import { useAppStore } from '@/lib/store/use-app-store'

jest.mock('@/lib/store/use-app-store')

describe('SearchBar', () => {
  const mockSetSearchQuery = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAppStore as jest.Mock).mockImplementation((selector) => {
      return selector({
        searchQuery: '',
        setSearchQuery: mockSetSearchQuery,
      })
    })
  })
  
  test('should update search query after debounce', async () => {
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'react' } })
    
    // Should not call immediately due to debounce
    expect(mockSetSearchQuery).not.toHaveBeenCalled()
    
    // Should call after debounce
    await waitFor(() => {
      expect(mockSetSearchQuery).toHaveBeenCalledWith('react')
    }, { timeout: 400 })
  })
})
```

## State Management Decision Tree

Use this decision tree to determine which state management approach to use:

1. **Is the state specific to a single component?**
   - Yes: Use `useState` or `useReducer`
   - No: Continue to next question

2. **Is the state related to server data?**
   - Yes: Use SWR or React Query
   - No: Continue to next question

3. **Does the state need to be shared among a few related components?**
   - Yes: Use React Context
   - No: Continue to next question

4. **Is the state complex or needs to be accessed globally?**
   - Yes: Use Zustand
   - No: Reconsider if you really need global state