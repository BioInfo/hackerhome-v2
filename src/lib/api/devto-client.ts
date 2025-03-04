import { BaseApiClient, ApiError } from './base-client';

export interface DevToArticle {
  id: number;
  title: string;
  description: string;
  published_at: string;
  tag_list: string[];
  slug: string;
  path: string;
  url: string;
  canonical_url: string;
  comments_count: number;
  public_reactions_count: number;
  positive_reactions_count: number;
  cover_image: string | null;
  social_image: string | null;
  created_at: string;
  edited_at: string | null;
  crossposted_at: string | null;
  published: boolean;
  published_timestamp: string;
  reading_time_minutes: number;
  user: {
    name: string;
    username: string;
    twitter_username: string | null;
    github_username: string | null;
    website_url: string | null;
    profile_image: string;
  };
}

export interface NormalizedDevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  author: string;
  authorImage: string;
  timestamp: number;
  reactions: number;
  commentCount: number;
  readingTime: number;
  tags: string[];
  coverImage: string | null;
  source: 'devto';
}

/**
 * Client for the DEV.to API
 * Documentation: https://developers.forem.com/api
 */
export class DevToClient extends BaseApiClient {
  constructor() {
    super(
      'https://dev.to/api/',
      'devto',
      {},
      { maxRequests: 30, windowMs: 60 * 1000 } // DEV.to API has stricter rate limits
    );
  }

  /**
   * Get the latest articles from DEV.to
   */
  async getLatestArticles(limit: number = 30): Promise<NormalizedDevToArticle[]> {
    try {
      const articles = await this.get<DevToArticle[]>('articles', {
        per_page: limit.toString(),
      });
      
      return articles.map(this.normalizeArticle);
    } catch (error) {
      console.error('Error fetching DEV.to latest articles:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch latest articles: ${error}`, 0, this.source, false);
    }
  }

  /**
   * Get articles by tag from DEV.to
   */
  async getArticlesByTag(tag: string, limit: number = 30): Promise<NormalizedDevToArticle[]> {
    try {
      const articles = await this.get<DevToArticle[]>('articles', {
        tag,
        per_page: limit.toString(),
      });
      
      return articles.map(this.normalizeArticle);
    } catch (error) {
      console.error(`Error fetching DEV.to articles with tag ${tag}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch articles by tag: ${error}`, 0, this.source, false);
    }
  }

  /**
   * Get a specific article by ID
   */
  async getArticle(id: number): Promise<NormalizedDevToArticle> {
    try {
      const article = await this.get<DevToArticle>(`articles/${id}`);
      return this.normalizeArticle(article);
    } catch (error) {
      console.error(`Error fetching DEV.to article with ID ${id}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch article: ${error}`, 0, this.source, false);
    }
  }

  /**
   * Normalize a DEV.to article to a common format
   */
  private normalizeArticle(article: DevToArticle): NormalizedDevToArticle {
    return {
      id: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      author: article.user.name,
      authorImage: article.user.profile_image,
      timestamp: new Date(article.published_at).getTime() / 1000,
      reactions: article.public_reactions_count,
      commentCount: article.comments_count,
      readingTime: article.reading_time_minutes,
      tags: article.tag_list,
      coverImage: article.cover_image,
      source: 'devto',
    };
  }
}

// Export a singleton instance
export const devToClient = new DevToClient();