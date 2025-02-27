'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useNews } from '@/lib/hooks'

export function Sidebar() {
  const { sources, sourceErrors, updateSource, refreshNews, isLoading, setRefreshInterval } = useNews()
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)

  // Set up auto-refresh when enabled/disabled
  useEffect(() => {
    if (autoRefreshEnabled) {
      setRefreshInterval(5 * 60 * 1000) // 5 minutes
    } else {
      setRefreshInterval(null)
    }
  }, [autoRefreshEnabled, setRefreshInterval])

  const toggleSource = (id: string) => {
    const source = sources.find(s => s.id === id)
    if (source) {
      console.log(`Sidebar: Toggling source ${id} from ${source.enabled} to ${!source.enabled}`);
      updateSource(id, !source.enabled)
    }
  }

  const handleRefresh = () => {
    refreshNews()
  }

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled)
  }

  // Find error for a specific source
  const getSourceError = (sourceId: string) => {
    return sourceErrors?.find(error => error.id === sourceId)
  }

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-border/40 md:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Sources</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground disabled:opacity-50"
              title="Refresh"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
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
              className={`rounded-md p-1 ${
                autoRefreshEnabled 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
              }`}
              title={autoRefreshEnabled ? "Auto-refresh on (5 minutes)" : "Auto-refresh off"}
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
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </button>
          </div>
        </div>
        <nav className="flex-1 overflow-auto p-2">
          <ul className="space-y-2">
            {sources.map((source) => {
              const error = getSourceError(source.id);
              return (
                <li key={source.id}>
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleSource(source.id)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm ${
                        source.enabled
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                      }`}
                      aria-pressed={source.enabled}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">
                          {source.enabled ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </span>
                        {source.name}
                      </div>
                      {error && (
                        <span className="text-destructive" title={error.message}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                        </span>
                      )}
                    </button>
                    {error && source.enabled && (
                      <div className="ml-7 rounded-md bg-destructive/10 px-3 py-1 text-xs text-destructive">
                        {error.message.length > 50 
                          ? `${error.message.substring(0, 50)}...` 
                          : error.message}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-border/40 p-4">
          <div className="space-y-1">
            <Link
              href="/settings"
              className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            <Link
              href="/help"
              className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              Help
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}