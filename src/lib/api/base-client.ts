/**
 * Base API client for making HTTP requests
 */
export class BaseApiClient {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;
  protected cacheDuration: number = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  /**
   * Make a GET request to the specified endpoint
   */
  protected async get<T>(
    endpoint: string,
    params: Record<string, string> = {},
    headers: Record<string, string> = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      next: { revalidate: this.cacheDuration / 1000 }, // Convert to seconds for Next.js
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Build a URL with query parameters
   */
  private buildUrl(endpoint: string, params: Record<string, string>): string {
    const url = new URL(endpoint, this.baseUrl);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
    
    return url.toString();
  }
}