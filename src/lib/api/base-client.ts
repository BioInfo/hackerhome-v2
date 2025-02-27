/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  source: string;
  retryable: boolean;

  constructor(message: string, status: number, source: string, retryable = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.source = source;
    this.retryable = retryable;
  }
}

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfterMs: number;
}

/**
 * Rate limiting state
 */
interface RateLimitState {
  requests: number;
  resetTime: number;
  queue: Array<() => Promise<any>>;
  processing: boolean;
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

/**
 * Base API client for making HTTP requests
 */
export class BaseApiClient {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;
  protected source: string;
  protected cacheDuration: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  protected rateLimitConfig: RateLimitConfig;
  private rateLimitState: RateLimitState;
  private cache = new Map<string, CacheEntry>();

  constructor(
    baseUrl: string, 
    source: string,
    defaultHeaders: Record<string, string> = {},
    rateLimitConfig?: Partial<RateLimitConfig>
  ) {
    this.baseUrl = baseUrl;
    this.source = source;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
    this.rateLimitConfig = {
      maxRequests: 60,
      windowMs: 60 * 1000, // 1 minute
      retryAfterMs: 1000, // 1 second
      ...rateLimitConfig
    };
    this.rateLimitState = {
      requests: 0,
      resetTime: Date.now() + this.rateLimitConfig.windowMs,
      queue: [],
      processing: false
    };

    // Set up periodic cache cleanup
    try {
      if (typeof window !== 'undefined' && typeof window.setInterval === 'function') {
        setInterval(() => this.clearExpiredCache(), this.cacheDuration);
      }
    } catch (error) {
      console.error(`[${this.source}] Failed to set up cache cleanup:`, error);
    }
  }

  /**
   * Make a GET request to the specified endpoint
   */
  protected async get<T>( 
    endpoint: string,
    params: Record<string, string> = {},
    headers: Record<string, string> = {},
    useCache: boolean = true,
    retries: number = 3
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const cacheKey = url.toString();
    
    // Check cache if enabled
    if (useCache) {
      try {
        const cachedData = this.getFromCache<T>(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      } catch (error) {
        console.error(`[${this.source}] Cache access error:`, error);
        // Continue without cache if there's an error
      }
    }
    
    // Apply rate limiting
    try {
      await this.checkRateLimit();
    } catch (error) {
      console.error(`[${this.source}] Rate limiting error:`, error);
      // Continue without rate limiting if there's an error
    }
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        next: { revalidate: this.cacheDuration / 1000 }, // Convert to seconds for Next.js
      });
      
      if (!response.ok) {
        const retryable = response.status >= 500 || response.status === 429;
        throw new ApiError(
          `API error: ${response.status} ${response.statusText}`,
          response.status,
          this.source,
          retryable
        );
      }
      
      const data = await response.json() as T;
      
      // Cache the response if caching is enabled
      if (useCache) {
        try {
          this.saveToCache(cacheKey, data);
        } catch (error) {
          console.error(`[${this.source}] Failed to cache response:`, error);
          // Continue without caching if there's an error
        }
      }
      
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.retryable && retries > 0) {
          console.warn(`[${this.source}] Retrying request to ${url}, ${retries} retries left`);
          await new Promise(resolve => setTimeout(resolve, this.rateLimitConfig.retryAfterMs));
          return this.get<T>(endpoint, params, headers, useCache, retries - 1);
        }
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : String(error),
        0,
        this.source,
        false
      );
    }
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
  
  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    try {
      const cached = this.cache.get(key);
      const now = Date.now();
      
      if (cached && now - cached.timestamp < this.cacheDuration) {
        return cached.data as T;
      }
    } catch (error) {
      console.error(`[${this.source}] Cache get error:`, error);
    }
    
    return null;
  }
  
  /**
   * Save data to cache
   */
  private saveToCache<T>(key: string, data: T): void {
    try {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`[${this.source}] Cache save error:`, error);
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
      console.error(`[${this.source}] Cache cleanup error:`, error);
    }
  }
  
  /**
   * Check rate limit and wait if necessary
   */
  private async checkRateLimit(): Promise<void> {
    return new Promise<void>((resolve) => {
      // Add request to queue
      this.rateLimitState.queue.push(async () => {
        try {
          const now = Date.now();
          
          // Reset if window has passed
          if (now > this.rateLimitState.resetTime) {
            this.rateLimitState.requests = 0;
            this.rateLimitState.resetTime = now + this.rateLimitConfig.windowMs;
          }
          
          // Check if limit exceeded
          if (this.rateLimitState.requests >= this.rateLimitConfig.maxRequests) {
            const waitTime = this.rateLimitState.resetTime - now;
            await new Promise(r => setTimeout(r, waitTime));
            this.rateLimitState.requests = 0;
            this.rateLimitState.resetTime = Date.now() + this.rateLimitConfig.windowMs;
          }
          
          // Increment request count
          this.rateLimitState.requests++;
        } catch (error) {
          console.error(`[${this.source}] Rate limit check error:`, error);
        }
        resolve();
      });
      
      this.processQueue();
    });
  }
  
  /**
   * Process the rate limiting queue
   */
  private async processQueue(): Promise<void> {
    if (!this.rateLimitState.processing && this.rateLimitState.queue.length > 0) {
      this.rateLimitState.processing = true;
      try {
        while (this.rateLimitState.queue.length > 0) {
          const request = this.rateLimitState.queue.shift();
          if (request) await request();
        }
      } catch (error) {
        console.error(`[${this.source}] Queue processing error:`, error);
      } finally {
        this.rateLimitState.processing = false;
      }
    }
  }
}