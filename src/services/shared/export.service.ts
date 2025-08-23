/**
 * Shared Export Service
 * Provides common export functionality that can be used across different entities
 */

export interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: any) => string;
}

export interface ExportConfig {
  filename: string;
  columns: ExportColumn[];
  includeTimestamp?: boolean;
}

/**
 * Generic Export Service
 */
export class ExportService {

  /**
   * Export data to CSV format
   */
  async exportToCSV<T>(data: T[], config: ExportConfig): Promise<Blob> {
    try {
      const { columns, filename, includeTimestamp = true } = config;
      
      // Generate headers
      const headers = columns.map(col => col.header);
      
      // Generate rows
      const rows = data.map(item => 
        columns.map(col => {
          const value = this.getNestedValue(item, col.key);
          const formattedValue = col.formatter ? col.formatter(value) : String(value || '');
          return `"${this.escapeCsvValue(formattedValue)}"`;
        }).join(',')
      );

      // Combine headers and rows
      const csvContent = [headers.join(','), ...rows].join('\n');
      
      // Add BOM for proper UTF-8 encoding in Excel
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });

      return blob;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error(`Failed to export to CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob: Blob, filename: string): void {
    try {
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
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export and download CSV in one operation
   */
  async exportAndDownloadCSV<T>(data: T[], config: ExportConfig): Promise<void> {
    try {
      const blob = await this.exportToCSV(data, config);
      const timestamp = config.includeTimestamp ? `_${this.getTimestamp()}` : '';
      const filename = `${config.filename}${timestamp}.csv`;
      
      this.downloadBlob(blob, filename);
    } catch (error) {
      console.error('Error exporting and downloading CSV:', error);
      throw new Error(`Failed to export and download CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate export configuration for common data types
   */
  createStandardConfig(entityType: 'contract' | 'project' | 'partner', customColumns?: ExportColumn[]): ExportConfig {
    const baseConfigs = {
      contract: {
        filename: 'contracts_export',
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'customId', header: '自訂編號' },
          { key: 'name', header: '名稱' },
          { key: 'contractor', header: '承包商' },
          { key: 'client', header: '客戶' },
          { key: 'startDate', header: '開始日期', formatter: this.formatDate },
          { key: 'endDate', header: '結束日期', formatter: this.formatDate },
          { key: 'totalValue', header: '總價值', formatter: this.formatCurrency },
          { key: 'status', header: '狀態' },
        ] as ExportColumn[]
      },
      project: {
        filename: 'projects_export',
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: '專案名稱' },
          { key: 'description', header: '描述' },
          { key: 'status', header: '狀態' },
          { key: 'createdAt', header: '建立日期', formatter: this.formatDate },
        ] as ExportColumn[]
      },
      partner: {
        filename: 'partners_export',
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: '合作夥伴名稱' },
          { key: 'type', header: '類型' },
          { key: 'contactEmail', header: '聯絡信箱' },
          { key: 'createdAt', header: '建立日期', formatter: this.formatDate },
        ] as ExportColumn[]
      }
    };

    const baseConfig = baseConfigs[entityType];
    
    if (customColumns) {
      baseConfig.columns = [...baseConfig.columns, ...customColumns];
    }

    return baseConfig;
  }

  /**
   * Format date for export
   */
  private formatDate = (date: any): string => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('zh-TW');
    } catch {
      return String(date);
    }
  };

  /**
   * Format currency for export
   */
  private formatCurrency = (value: any): string => {
    if (value === null || value === undefined) return '';
    const numValue = Number(value);
    if (isNaN(numValue)) return String(value);
    return `$${numValue.toLocaleString()}`;
  };

  /**
   * Format percentage for export
   */
  private formatPercentage = (value: any): string => {
    if (value === null || value === undefined) return '';
    const numValue = Number(value);
    if (isNaN(numValue)) return String(value);
    return `${(numValue * 100).toFixed(2)}%`;
  };

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : '';
    }, obj);
  }

  /**
   * Escape CSV values to handle quotes and commas
   */
  private escapeCsvValue(value: string): string {
    if (typeof value !== 'string') return String(value);
    return value.replace(/"/g, '""');
  }

  /**
   * Get timestamp for filename
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
  }

  /**
   * Validate export data
   */
  validateExportData<T>(data: T[], config: ExportConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('Data must be an array');
    }

    if (data.length === 0) {
      errors.push('Data array is empty');
    }

    if (!config.filename || config.filename.trim().length === 0) {
      errors.push('Filename is required');
    }

    if (!config.columns || config.columns.length === 0) {
      errors.push('At least one column must be specified');
    }

    // Validate column keys exist in data
    if (data.length > 0 && config.columns) {
      const sampleItem = data[0];
      const missingKeys = config.columns
        .map(col => col.key)
        .filter(key => this.getNestedValue(sampleItem, key) === undefined);
      
      if (missingKeys.length > 0) {
        errors.push(`Missing keys in data: ${missingKeys.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get export statistics
   */
  getExportStats<T>(data: T[]): {
    totalRecords: number;
    estimatedFileSize: string;
    exportDate: string;
  } {
    const totalRecords = data.length;
    
    // Rough estimation of file size (assuming average 100 bytes per record)
    const estimatedBytes = totalRecords * 100;
    const estimatedFileSize = this.formatFileSize(estimatedBytes);
    
    const exportDate = new Date().toLocaleString('zh-TW');

    return {
      totalRecords,
      estimatedFileSize,
      exportDate
    };
  }

  /**
   * Format file size in human readable format
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const exportService = new ExportService();