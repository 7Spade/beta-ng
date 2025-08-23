/**
 * Shared Export Service
 * Provides common export functionality for different data types
 */

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  formatter?: (value: any, item: T) => string;
}

export interface ExportOptions {
  filename?: string;
  delimiter?: string;
  includeHeaders?: boolean;
  encoding?: string;
}

export class ExportService {
  /**
   * Converts data to CSV format
   */
  static toCSV<T>(
    data: T[],
    columns: ExportColumn<T>[],
    options: ExportOptions = {}
  ): string {
    const {
      delimiter = ',',
      includeHeaders = true,
    } = options;

    const rows: string[] = [];

    // Add headers if requested
    if (includeHeaders) {
      const headers = columns.map(col => this.escapeCSVValue(col.header));
      rows.push(headers.join(delimiter));
    }

    // Add data rows
    data.forEach(item => {
      const row = columns.map(col => {
        let value: any;
        
        if (typeof col.key === 'string' && col.key.includes('.')) {
          // Handle nested properties (e.g., 'user.name')
          value = this.getNestedValue(item, col.key);
        } else {
          value = (item as any)[col.key];
        }

        // Apply formatter if provided
        if (col.formatter) {
          value = col.formatter(value, item);
        }

        return this.escapeCSVValue(value);
      });
      
      rows.push(row.join(delimiter));
    });

    return rows.join('\n');
  }

  /**
   * Downloads CSV data as a file
   */
  static downloadCSV(
    csvContent: string,
    filename: string = 'export.csv',
    encoding: string = 'utf-8'
  ): void {
    const mimeType = `text/csv;charset=${encoding}`;
    const blob = new Blob([csvContent], { type: mimeType });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  /**
   * Exports data to CSV and triggers download
   */
  static exportToCSV<T>(
    data: T[],
    columns: ExportColumn<T>[],
    options: ExportOptions = {}
  ): void {
    const csvContent = this.toCSV(data, columns, options);
    const filename = options.filename || 'export.csv';
    this.downloadCSV(csvContent, filename, options.encoding);
  }

  /**
   * Escapes CSV values to handle commas, quotes, and newlines
   */
  private static escapeCSVValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);
    
    // If the value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  /**
   * Gets nested property value from an object using dot notation
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Formats date for CSV export
   */
  static formatDateForCSV(date: Date | string | null | undefined): string {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Formats currency for CSV export
   */
  static formatCurrencyForCSV(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '';
    return amount.toString();
  }

  /**
   * Formats boolean for CSV export
   */
  static formatBooleanForCSV(value: boolean | null | undefined): string {
    if (value === null || value === undefined) return '';
    return value ? 'Yes' : 'No';
  }
}