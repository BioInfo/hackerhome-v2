'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { newsService, NewsSource, NewsFilter } from '@/lib/services/news-service'
import { NewsItem, ApiError } from '@/lib/api'

interface SourceError {
  id: string;
  message: string;
}

interface UseNewsResult {
  news: NewsItem[]
  sources: NewsSource[]
  isLoading: boolean
  error: Error | null
  sourceErrors: SourceError[]
  updateSource: (id: string, enabled: boolean) => void
  refreshNews: (filter?: NewsFilter) => Promise<void>
  setRefreshInterval: (intervalMs: number | null) => void
}

/**
 * Custom hook for accessing and managing news data
 */
export function useNews(initialFilter?: NewsFilter): UseNewsResult {
  const [news, setNews] = useState<NewsItem[]>([])
  const [sources, setSources] = useState<NewsSource[]>(newsService.getSources())
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [sourceErrors, setSourceErrors] = useState<SourceError[]>([])
  const [refreshIntervalTime, setRefreshIntervalTime] = useState<number | null>(null)
  const [currentFilter, setCurrentFilter] = useState<NewsFilter | undefined>(initialFilter)
  
  // Use refs to avoid dependency cycles
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef<boolean>(false)

  // Get the current enabled sources
  const getEnabledSources = useCallback((): string[] => {
    return sources.filter(s => s.enabled).map(s => s.id);
  }, [sources]);

  // Memoize the refresh function to avoid recreating it on each render
  const refreshNews = useCallback(async (filter?: NewsFilter) => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    
    setIsLoading(true)
    setError(null)
    
    // Update current filter if provided
    if (filter) {
      setCurrentFilter(filter)
    }
    
    // Always include the current enabled sources in the filter
    const enabledSources = getEnabledSources();
    const mergedFilter: NewsFilter = {
      ...(filter || currentFilter || {}),
      sources: enabledSources
    };
    
    try {
      console.log('Fetching news with filter:', mergedFilter);
      const items = await newsService.getAggregatedNews(mergedFilter)
      setNews(items)
      
      // Check for source-specific errors
      const errors: SourceError[] = []
      sources.forEach(source => {
        try {
          const errorMessage = newsService.getSourceError(source.id)
          if (errorMessage) {
            errors.push({
              id: source.id,
              message: errorMessage
            })
          }
        } catch (err) {
          console.error(`Error getting error for source ${source.id}:`, err);
        }
      })
      setSourceErrors(errors)
    } catch (err) {
      console.error('Error fetching news:', err);
      if (err instanceof ApiError) {
        setError(err)
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch news'))
      }
    } finally {
      setIsLoading(false)
      isRefreshingRef.current = false;
    }
  }, [currentFilter, sources, getEnabledSources])

  const updateSource = useCallback((id: string, enabled: boolean) => {
    console.log(`Toggling source ${id} to ${enabled}`);
    
    // Update our local state first
    setSources(prev => {
      const newSources = prev.map(source => 
        source.id === id ? { ...source, enabled } : source
      );
      
      // Then update the service
      try {
        newsService.updateSource(id, enabled);
      } catch (err) {
        console.error(`Error updating source ${id}:`, err);
      }
      
      return newSources;
    });
  }, []);

  // Set up or clear the refresh interval
  const setRefreshInterval = useCallback((intervalMs: number | null) => {
    try {
      // Clear existing interval if any
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
      
      // Set new interval if requested
      if (intervalMs && intervalMs > 0) {
        setRefreshIntervalTime(intervalMs)
        const id = setInterval(() => {
          refreshNews()
        }, intervalMs)
        intervalIdRef.current = id
      } else {
        setRefreshIntervalTime(null)
      }
    } catch (err) {
      console.error('Error setting refresh interval:', err);
    }
  }, [refreshNews])

  // Initial data fetch
  useEffect(() => {
    refreshNews(initialFilter)
    // We intentionally only want to run this on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refresh when sources change
  useEffect(() => {
    const enabledSourceIds = getEnabledSources();
    console.log('Sources changed, enabled sources:', enabledSourceIds);
    
    // Only refresh if we're not already refreshing
    if (!isRefreshingRef.current) {
      refreshNews();
    }
  }, [sources, refreshNews, getEnabledSources]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      try {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current)
          intervalIdRef.current = null
        }
      } catch (err) {
        console.error('Error cleaning up interval:', err);
      }
    }
  }, [])

  return {
    news,
    sources,
    isLoading,
    error,
    sourceErrors,
    updateSource,
    refreshNews,
    setRefreshInterval
  }
}