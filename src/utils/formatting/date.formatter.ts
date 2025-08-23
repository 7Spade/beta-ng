/**
 * Date Formatting Utilities
 * Provides functions for formatting dates
 */

/**
 * Format date as Taiwan locale string
 */
export function formatDateTW(date: Date): string {
  return date.toLocaleDateString('zh-TW');
}

/**
 * Format date and time as Taiwan locale string
 */
export function formatDateTimeTW(date: Date): string {
  return date.toLocaleString('zh-TW');
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format date as relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return '今天';
  } else if (diffInDays === 1) {
    return '昨天';
  } else if (diffInDays < 7) {
    return `${diffInDays} 天前`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} 週前`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} 個月前`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} 年前`;
  }
}

/**
 * Format date range
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = formatDateTW(startDate);
  const end = formatDateTW(endDate);
  return `${start} - ${end}`;
}