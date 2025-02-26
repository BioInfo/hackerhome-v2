'use client'

import { useState } from 'react'
import { MainLayout } from "@/components/layout/MainLayout"
import { useNews } from '@/lib/hooks'
import { formatRelativeTime } from '@/lib/api'

export default function Home() {
  const { news, isLoading, error } = useNews()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNews = searchQuery 
    ? news.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : news

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Latest Tech News</h1>
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
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <h3 className="font-medium">Error loading news</h3>
            <p className="mt-1 text-sm">{error.message}</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="rounded-lg border border-border/40 bg-card p-8 text-center">
            <h3 className="font-medium">No news found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Check back later for updates"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredNews.map((item) => (
              <div
                key={`${item.source}-${item.id}`}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
