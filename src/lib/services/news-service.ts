import { 
  hackerNewsClient, 
  devToClient, 
  githubClient,
  NewsItem,
  NormalizedHackerNewsItem,
  NormalizedDevToArticle,
  NormalizedGitHubRepository
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

/**
 * Service for aggregating news from multiple sources
 */
export class NewsService {
  private sources: NewsSource[] = [
    { id: 'hackernews', name: 'Hacker News', enabled: true },
    { id: 'devto', name: 'DEV.to', enabled: true },
    { id: 'github', name: 'GitHub', enabled: true },
  ];

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
    this.sources = this.sources.map(source => 
      source.id === id ? { ...source, enabled } : source
    );
  }

  /**
   * Get aggregated news from all enabled sources
   */
  async getAggregatedNews(filter?: NewsFilter): Promise<NewsItem[]> {
    const enabledSources = filter?.sources || 
      this.sources.filter(s => s.enabled).map(s => s.id);
    
    const promises: Promise<NewsItem[]>[] = [];
    
    if (enabledSources.includes('hackernews')) {
      promises.push(this.getHackerNews());
    }
    
    if (enabledSources.includes('devto')) {
      promises.push(this.getDevToArticles());
    }
    
    if (enabledSources.includes('github')) {
      promises.push(this.getGitHubRepositories());
    }
    
    const results = await Promise.all(promises);
    let allItems = results.flat();
    
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
    return allItems.sort((a, b) => b.timestamp - a.timestamp);
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
      return [];
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
      return [];
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
      return [];
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
}

// Export a singleton instance
export const newsService = new NewsService();