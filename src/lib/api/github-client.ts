import { BaseApiClient } from './base-client';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface NormalizedGitHubRepository {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  author: string;
  authorImage: string;
  authorUrl: string;
  timestamp: number;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  source: 'github';
}

/**
 * Client for the GitHub API
 * Documentation: https://docs.github.com/en/rest
 */
export class GitHubClient extends BaseApiClient {
  constructor() {
    const headers: Record<string, string> = {};
    
    // Add GitHub token if available
    if (process.env.GITHUB_API_KEY) {
      headers['Authorization'] = `token ${process.env.GITHUB_API_KEY}`;
    }
    
    super('https://api.github.com/', headers);
  }

  /**
   * Get trending repositories from GitHub
   */
  async getTrendingRepositories(
    language?: string,
    since: 'daily' | 'weekly' | 'monthly' = 'daily',
    limit: number = 30
  ): Promise<NormalizedGitHubRepository[]> {
    // GitHub doesn't have a direct trending API, so we use the search API
    // with sort by stars and filter by creation date
    const dateFilter = this.getDateFilterForTrending(since);
    
    const params: Record<string, string> = {
      q: `created:>${dateFilter}${language ? ` language:${language}` : ''}`,
      sort: 'stars',
      order: 'desc',
      per_page: limit.toString(),
    };
    
    const response = await this.get<{
      items: GitHubRepository[];
    }>('search/repositories', params);
    
    return response.items.map(this.normalizeRepository);
  }

  /**
   * Get a specific repository by owner and name
   */
  async getRepository(owner: string, repo: string): Promise<NormalizedGitHubRepository> {
    const repository = await this.get<GitHubRepository>(`repos/${owner}/${repo}`);
    return this.normalizeRepository(repository);
  }

  /**
   * Get repositories for a specific user or organization
   */
  async getUserRepositories(username: string, limit: number = 30): Promise<NormalizedGitHubRepository[]> {
    const repositories = await this.get<GitHubRepository[]>(`users/${username}/repos`, {
      sort: 'updated',
      per_page: limit.toString(),
    });
    
    return repositories.map(this.normalizeRepository);
  }

  /**
   * Normalize a GitHub repository to a common format
   */
  private normalizeRepository(repo: GitHubRepository): NormalizedGitHubRepository {
    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      author: repo.owner.login,
      authorImage: repo.owner.avatar_url,
      authorUrl: repo.owner.html_url,
      timestamp: new Date(repo.created_at).getTime() / 1000,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      topics: repo.topics,
      source: 'github',
    };
  }

  /**
   * Get date filter string for trending repositories
   */
  private getDateFilterForTrending(since: 'daily' | 'weekly' | 'monthly'): string {
    const date = new Date();
    
    switch (since) {
      case 'daily':
        date.setDate(date.getDate() - 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - 1);
        break;
    }
    
    return date.toISOString().split('T')[0];
  }
}

// Export a singleton instance
export const githubClient = new GitHubClient();