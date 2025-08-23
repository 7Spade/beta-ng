/**
 * Currency Formatting Utilities
 * Provides functions for formatting currency values
 */

/**
 * Format number as Taiwan Dollar currency
 */
export function formatTWD(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
  }).format(amount);
}

/**
 * Format number as US Dollar currency
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('zh-TW').format(amount);
}

/**
 * Format currency based on locale
 */
export function formatCurrency(amount: number, currency: string = 'TWD', locale: string = 'zh-TW'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}