// Export all API clients
export * from './base-client';
export * from './hacker-news-client';
export * from './devto-client';
export * from './github-client';

// Export a common interface for normalized items
export interface NewsItem {
  id: number | string;
  title: string;
  url?: string;
  content?: string;
  description?: string;
  author: string;
  authorImage?: string;
  authorUrl?: string;
  timestamp: number;
  points?: number;
  reactions?: number;
  stars?: number;
  forks?: number;
  commentCount?: number;
  readingTime?: number;
  language?: string | null;
  tags?: string[];
  coverImage?: string | null;
  source: 'hackernews' | 'devto' | 'github';
}

// Utility function to format relative time
export function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 60) {
    return 'just now';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diff < 2592000) {
    const weeks = Math.floor(diff / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diff < 31536000) {
    const months = Math.floor(diff / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diff / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}