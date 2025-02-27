import { 
  hackerNewsClient, 
  devToClient, 
  githubClient,
  NewsItem,
  NormalizedHackerNewsItem,
  NormalizedDevToArticle,
  NormalizedGitHubRepository,
  ApiError
} from '../api';

export interface NewsSource {
  id: string;
  name: string;
  enabled: boolean;
}

export interface NewsFilter {
  sources?: string[];
  search?: string;
  tags?: string[];
}

interface CacheEntry {
  data: NewsItem[];
  timestamp: number;
}

/**
 * Service for aggregating news from multiple sources
 */
export class NewsService {
  private sources: NewsSource[] = [
    { id: 'hackernews', name: 'Hacker News', enabled: true },
    { id: 'devto', name: 'DEV.to', enabled: true },
    { id: 'github', name: 'GitHub', enabled: true },
  ];
  
  // Use a simple in-memory cache
  private cache: Map<string, CacheEntry> = new Map();
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  private sourceErrors: Map<string, { message: string; timestamp: number }> = new Map();
  private cacheCleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Set up periodic cache cleanup if in browser environment
    if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
      try {
        this.cacheCleanupInterval = setInterval(() => {
          this.clearExpiredCache();
        }, this.cacheDuration);
      } catch (error) {
        console.error('Failed to set up cache cleanup interval:', error);
      }
    }
  }

  /**
   * Get available news sources
   */
  getSources(): NewsSource[] {
    return [...this.sources];
  }

  /**
   * Update source enabled status
   */
  updateSource(id: string, enabled: boolean): void {
    console.log(`NewsService: Updating source ${id} to ${enabled}`);
    this.sources = this.sources.map(source => 
      source.id === id ? { ...source, enabled } : source
    );
    
    // Clear cache when sources change
    this.clearCache();
  }

  /**
   * Get source error status
   */
  getSourceError(id: string): string | null {
    const error = this.sourceErrors.get(id);
    if (!error) return null;
    
    // Clear errors after 1 hour
    if (Date.now() - error.timestamp > 60 * 60 * 1000) {
      this.sourceErrors.delete(id);
      return null;
    }
    
    return error.message;
  }

  /**
   * Get aggregated news from all enabled sources
   */
  async getAggregatedNews(filter?: NewsFilter): Promise<NewsItem[]> {
    // If no sources are specified in the filter, use the enabled sources from the service
    const enabledSources = filter?.sources || 
      this.sources.filter(s => s.enabled).map(s => s.id);
    
    console.log('NewsService: Getting news with enabled sources:', enabledSources);
    
    // If no sources are enabled, return an empty array
    if (enabledSources.length === 0) {
      console.log('NewsService: No sources enabled, returning empty array');
      return [];
    }
    
    // Generate cache key based on enabled sources and filters
    const cacheKey = this.generateCacheKey(enabledSources, filter);
    
    // Check cache first
    try {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('NewsService: Returning cached data for key:', cacheKey);
        return cachedData;
      }
    } catch (error) {
      console.error('Error accessing cache:', error);
      // Continue without cache if there's an error
    }
    
    const promises: Array<Promise<{ source: string; items: NewsItem[] }>> = [];
    
    if (enabledSources.includes('hackernews')) {
      promises.push(this.getHackerNews().then(items => ({ source: 'hackernews', items })));
    }
    
    if (enabledSources.includes('devto')) {
      promises.push(this.getDevToArticles().then(items => ({ source: 'devto', items })));
    }
    
    if (enabledSources.includes('github')) {
      promises.push(this.getGitHubRepositories().then(items => ({ source: 'github', items })));
    }
    
    // Use Promise.allSettled to handle partial failures
    const results = await Promise.allSettled(promises);
    let allItems: NewsItem[] = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allItems = [...allItems, ...result.value.items];
        // Clear any previous errors for this source
        this.sourceErrors.delete(result.value.source);
      } else {
        // Extract source from the rejected promise if possible
        const errorMessage = result.reason?.message || 'Unknown error';
        const source = result.reason?.source || 'unknown';
        
        console.error(`Error fetching from ${source}:`, errorMessage);
        
        // Store the error for the UI to display
        this.sourceErrors.set(source, {
          message: errorMessage,
          timestamp: Date.now()
        });
      }
    });
    
    // Filter items to only include those from enabled sources
    allItems = allItems.filter(item => enabledSources.includes(item.source));
    
    // Apply search filter if provided
    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      allItems = allItems.filter(item => 
        item.title.toLowerCase().includes(searchLower) || 
        item.description?.toLowerCase().includes(searchLower) ||
        item.content?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply tag filter if provided
    if (filter?.tags && filter.tags.length > 0) {
      allItems = allItems.filter(item => 
        item.tags?.some(tag => 
          filter.tags?.includes(tag.toLowerCase())
        )
      );
    }
    
    // Sort by timestamp (newest first)
    const sortedItems = allItems.sort((a, b) => b.timestamp - a.timestamp);
    
    // Cache the results
    try {
      this.saveToCache(cacheKey, sortedItems);
    } catch (error) {
      console.error('Error saving to cache:', error);
      // Continue without caching if there's an error
    }
    
    console.log(`NewsService: Returning ${sortedItems.length} items for sources:`, enabledSources);
    return sortedItems;
  }

  /**
   * Get news from Hacker News
   */
  private async getHackerNews(): Promise<NewsItem[]> {
    try {
      const items = await hackerNewsClient.getTopStories(30);
      return this.normalizeHackerNewsItems(items);
    } catch (error) {
      console.error('Error fetching Hacker News:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch from Hacker News: ${error}`, 0, 'hackernews', false);
    }
  }

  /**
   * Get articles from DEV.to
   */
  private async getDevToArticles(): Promise<NewsItem[]> {
    try {
      const articles = await devToClient.getLatestArticles(30);
      return this.normalizeDevToArticles(articles);
    } catch (error) {
      console.error('Error fetching DEV.to articles:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch from DEV.to: ${error}`, 0, 'devto', false);
    }
  }

  /**
   * Get repositories from GitHub
   */
  private async getGitHubRepositories(): Promise<NewsItem[]> {
    try {
      const repositories = await githubClient.getTrendingRepositories(undefined, 'daily', 30);
      return this.normalizeGitHubRepositories(repositories);
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch from GitHub: ${error}`, 0, 'github', false);
    }
  }

  /**
   * Normalize Hacker News items to the common NewsItem format
   */
  private normalizeHackerNewsItems(items: NormalizedHackerNewsItem[]): NewsItem[] {
    return items.map(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      content: item.content,
      author: item.author,
      timestamp: item.timestamp,
      points: item.points,
      commentCount: item.commentCount,
      source: item.source,
    }));
  }

  /**
   * Normalize DEV.to articles to the common NewsItem format
   */
  private normalizeDevToArticles(articles: NormalizedDevToArticle[]): NewsItem[] {
    return articles.map(article => ({
      id: article.id,
      title: article.title,
      url: article.url,
      description: article.description,
      author: article.author,
      authorImage: article.authorImage,
      timestamp: article.timestamp,
      reactions: article.reactions,
      commentCount: article.commentCount,
      readingTime: article.readingTime,
      tags: article.tags,
      coverImage: article.coverImage,
      source: article.source,
    }));
  }

  /**
   * Normalize GitHub repositories to the common NewsItem format
   */
  private normalizeGitHubRepositories(repositories: NormalizedGitHubRepository[]): NewsItem[] {
    return repositories.map(repo => ({
      id: repo.id,
      title: repo.name,
      url: repo.url,
      description: repo.description || '',
      author: repo.author,
      authorImage: repo.authorImage,
      authorUrl: repo.authorUrl,
      timestamp: repo.timestamp,
      stars: repo.stars,
      forks: repo.forks,
      language: repo.language,
      tags: repo.topics,
      source: repo.source,
    }));
  }
  
  /**
   * Generate a cache key based on sources and filters
   */
  private generateCacheKey(sources: string[], filter?: NewsFilter): string {
    return JSON.stringify({
      sources: sources.sort(),
      search: filter?.search || '',
      tags: filter?.tags?.sort() || []
    });
  }
  
  /**
   * Get data from cache
   */
  private getFromCache(key: string): NewsItem[] | null {
    try {
      const cached = this.cache.get(key);
      const now = Date.now();
      
      if (cached && now - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    } catch (error) {
      console.error('Error getting from cache:', error);
    }
    
    return null;
  }
  
  /**
   * Save data to cache
   */
  private saveToCache(key: string, data: NewsItem[]): void {
    try {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }
  
  /**
   * Clear all cache entries
   */
  private clearCache(): void {
    console.log('NewsService: Clearing cache');
    try {
      this.cache.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
  
  /**
   * Clear expired cache entries
   */
  private clearExpiredCache(): void {
    try {
      const now = Date.now();
      
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.cacheDuration) {
          this.cache.delete(key);
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }
}

// Export a singleton instance
export const newsService = new NewsService();