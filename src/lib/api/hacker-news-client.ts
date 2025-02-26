import { BaseApiClient } from './base-client';

export interface HackerNewsItem {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  time: number;
  score: number;
  descendants: number; // Number of comments
  kids?: number[]; // IDs of comments
  type: 'story' | 'comment' | 'job' | 'poll' | 'pollopt';
}

export interface HackerNewsUser {
  id: string;
  created: number;
  karma: number;
  about?: string;
  submitted?: number[];
}

export interface NormalizedHackerNewsItem {
  id: number;
  title: string;
  url?: string;
  content?: string;
  author: string;
  timestamp: number;
  points: number;
  commentCount: number;
  source: 'hackernews';
}

/**
 * Client for the Hacker News API
 * Documentation: https://github.com/HackerNews/API
 */
export class HackerNewsClient extends BaseApiClient {
  constructor() {
    super('https://hacker-news.firebaseio.com/v0/');
  }

  /**
   * Get the top stories from Hacker News
   */
  async getTopStories(limit: number = 30): Promise<NormalizedHackerNewsItem[]> {
    const storyIds = await this.get<number[]>('topstories.json');
    const limitedIds = storyIds.slice(0, limit);
    
    const stories = await Promise.all(
      limitedIds.map(id => this.getItem(id))
    );
    
    return stories
      .filter((story): story is HackerNewsItem => !!story && story.type === 'story')
      .map(this.normalizeItem);
  }

  /**
   * Get the newest stories from Hacker News
   */
  async getNewStories(limit: number = 30): Promise<NormalizedHackerNewsItem[]> {
    const storyIds = await this.get<number[]>('newstories.json');
    const limitedIds = storyIds.slice(0, limit);
    
    const stories = await Promise.all(
      limitedIds.map(id => this.getItem(id))
    );
    
    return stories
      .filter((story): story is HackerNewsItem => !!story && story.type === 'story')
      .map(this.normalizeItem);
  }

  /**
   * Get a specific item by ID
   */
  async getItem(id: number): Promise<HackerNewsItem | null> {
    return this.get<HackerNewsItem>(`item/${id}.json`);
  }

  /**
   * Get a user by ID
   */
  async getUser(id: string): Promise<HackerNewsUser | null> {
    return this.get<HackerNewsUser>(`user/${id}.json`);
  }

  /**
   * Normalize a Hacker News item to a common format
   */
  private normalizeItem(item: HackerNewsItem): NormalizedHackerNewsItem {
    return {
      id: item.id,
      title: item.title,
      url: item.url,
      content: item.text,
      author: item.by,
      timestamp: item.time,
      points: item.score,
      commentCount: item.descendants,
      source: 'hackernews',
    };
  }
}

// Export a singleton instance
export const hackerNewsClient = new HackerNewsClient();