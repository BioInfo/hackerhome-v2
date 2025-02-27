'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from "@/components/layout/MainLayout"
import { useNews } from '@/lib/hooks'
import { formatRelativeTime } from '@/lib/api'
import { motion } from '@/components/animations/motion'

export default function Home() {
  const { news, isLoading, error, sourceErrors, refreshNews, setRefreshInterval } = useNews()
  const [searchQuery, setSearchQuery] = useState('')
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)

  // Handle auto-refresh toggle
  useEffect(() => {
    if (autoRefreshEnabled) {
      setRefreshInterval(5 * 60 * 1000) // 5 minutes
    } else {
      setRefreshInterval(null)
    }
    
    return () => {
      // Clean up on unmount
      setRefreshInterval(null)
    }
  }, [autoRefreshEnabled, setRefreshInterval])

  const filteredNews = searchQuery 
    ? news.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : news

  const handleRefresh = () => {
    refreshNews()
  }

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Latest Tech News</h1>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                title="Refresh"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" 
                  />
                </svg>
              </button>
              <button
                onClick={toggleAutoRefresh}
                className={`rounded-md p-1.5 ${
                  autoRefreshEnabled 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                title={autoRefreshEnabled ? "Auto-refresh on (5 minutes)" : "Auto-refresh off"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="h-5 w-5"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search news..."
              className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Source errors banner */}
        {sourceErrors.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-500"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm font-medium">
                Some sources couldn't be loaded ({sourceErrors.length})
              </p>
            </div>
            <div className="mt-1 text-xs">
              {sourceErrors.map((error, index) => (
                <div key={error.id} className="mt-1">
                  <span className="font-medium">
                    {error.id === 'hackernews' ? 'Hacker News' : 
                     error.id === 'devto' ? 'DEV.to' : 'GitHub'}:
                  </span>{' '}
                  {error.message.length > 100 
                    ? `${error.message.substring(0, 100)}...` 
                    : error.message}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-lg border border-border/40 bg-card p-4 shadow-sm">
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted"></div>
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          >
            <h3 className="font-medium">Error loading news</h3>
            <p className="mt-1 text-sm">{error.message}</p>
            <button 
              onClick={handleRefresh}
              className="mt-3 inline-flex items-center rounded-md bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-1.5 h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Try Again
            </button>
          </motion.div>
        ) : filteredNews.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-border/40 bg-card p-8 text-center"
          >
            <h3 className="font-medium">No news found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Check back later for updates"}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 inline-flex items-center rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            {filteredNews.map((item, index) => (
              <motion.div
                key={`${item.source}-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className="rounded-lg border border-border/40 bg-card p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium hover:text-primary hover:underline"
                    >
                      {item.title}
                    </a>
                    {item.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description.length > 150
                          ? `${item.description.substring(0, 150)}...`
                          : item.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                        {item.source === 'hackernews'
                          ? 'Hacker News'
                          : item.source === 'devto'
                          ? 'DEV.to'
                          : 'GitHub'}
                      </span>
                      <span>•</span>
                      <span>{formatRelativeTime(item.timestamp)}</span>
                      {item.points !== undefined && (
                        <>
                          <span>•</span>
                          <span>{item.points} points</span>
                        </>
                      )}
                      {item.reactions !== undefined && (
                        <>
                          <span>•</span>
                          <span>{item.reactions} reactions</span>
                        </>
                      )}
                      {item.stars !== undefined && (
                        <>
                          <span>•</span>
                          <span>{item.stars} stars</span>
                        </>
                      )}
                      {item.commentCount !== undefined && (
                        <>
                          <span>•</span>
                          <span>{item.commentCount} comments</span>
                        </>
                      )}
                      {item.language && (
                        <>
                          <span>•</span>
                          <span>{item.language}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      aria-label="Save"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                        />
                      </svg>
                    </button>
                    <button
                      className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      aria-label="Share"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </MainLayout>
  )
}
