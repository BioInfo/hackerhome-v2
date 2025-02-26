'use client'

import { useState, useEffect } from 'react'
import { newsService, NewsSource } from '@/lib/services/news-service'
import { NewsItem } from '@/lib/api'

interface NewsFilter {
  sources?: string[];
  search?: string;
  tags?: string[];
}

interface UseNewsResult {
  news: NewsItem[]
  sources: NewsSource[]
  isLoading: boolean
  error: Error | null
  updateSource: (id: string, enabled: boolean) => void
  refreshNews: (filter?: NewsFilter) => Promise<void>
}

/**
 * Custom hook for accessing and managing news data
 */
export function useNews(initialFilter?: NewsFilter): UseNewsResult {
  const [news, setNews] = useState<NewsItem[]>([])
  const [sources, setSources] = useState<NewsSource[]>(newsService.getSources())
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshNews = async (filter?: NewsFilter) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const items = await newsService.getAggregatedNews(filter)
      setNews(items)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch news'))
      console.error('Error fetching news:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSource = (id: string, enabled: boolean) => {
    newsService.updateSource(id, enabled)
    setSources(newsService.getSources())
    refreshNews()
  }

  useEffect(() => {
    refreshNews(initialFilter)
    // We intentionally only want to run this on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    news,
    sources,
    isLoading,
    error,
    updateSource,
    refreshNews,
  }
}