/**
 * Export Service Tests
 */

import { ExportService } from '../export.service';

// Mock the DOM methods used in export
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn(),
  },
});

Object.defineProperty(global, 'Blob', {
  value: jest.fn(() => ({})),
});

// Mock document methods
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn(() => ({
      setAttribute: jest.fn(),
      click: mockClick,
      style: {},
    })),
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild,
    },
  },
});

describe('ExportService', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false },
  ];

  const mockColumns = [
    { key: 'id' as keyof typeof mockData[0], header: 'ID' },
    { key: 'name' as keyof typeof mockData[0], header: 'Name' },
    { key: 'email' as keyof typeof mockData[0], header: 'Email' },
    { 
      key: 'active' as keyof typeof mockData[0], 
      header: 'Active',
      formatter: (value: boolean) => value ? 'Yes' : 'No'
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toCSV', () => {
    it('should convert data to CSV format with headers', () => {
      const result = ExportService.toCSV(mockData, mockColumns);
      
      const lines = result.split('\n');
      expect(lines[0]).toBe('ID,Name,Email,Active');
      expect(lines[1]).toBe('1,John Doe,john@example.com,Yes');
      expect(lines[2]).toBe('2,Jane Smith,jane@example.com,No');
    });

    it('should convert data to CSV format without headers', () => {
      const result = ExportService.toCSV(mockData, mockColumns, { includeHeaders: false });
      
      const lines = result.split('\n');
      expect(lines[0]).toBe('1,John Doe,john@example.com,Yes');
      expect(lines[1]).toBe('2,Jane Smith,jane@example.com,No');
    });

    it('should handle custom delimiter', () => {
      const result = ExportService.toCSV(mockData, mockColumns, { delimiter: ';' });
      
      const lines = result.split('\n');
      expect(lines[0]).toBe('ID;Name;Email;Active');
      expect(lines[1]).toBe('1;John Doe;john@example.com;Yes');
    });

    it('should escape CSV values with commas and quotes', () => {
      const dataWithSpecialChars = [
        { name: 'John, Jr.', description: 'He said "Hello"' },
      ];
      
      const columns = [
        { key: 'name' as keyof typeof dataWithSpecialChars[0], header: 'Name' },
        { key: 'description' as keyof typeof dataWithSpecialChars[0], header: 'Description' },
      ];

      const result = ExportService.toCSV(dataWithSpecialChars, columns);
      
      const lines = result.split('\n');
      expect(lines[1]).toBe('"John, Jr.","He said ""Hello"""');
    });

    it('should handle nested properties', () => {
      const nestedData = [
        { user: { name: 'John', profile: { age: 30 } } },
      ];
      
      const columns = [
        { key: 'user.name', header: 'User Name' },
        { key: 'user.profile.age', header: 'Age' },
      ];

      const result = ExportService.toCSV(nestedData, columns);
      
      const lines = result.split('\n');
      expect(lines[1]).toBe('John,30');
    });

    it('should handle null and undefined values', () => {
      const dataWithNulls = [
        { name: 'John', email: null, phone: undefined },
      ];
      
      const columns = [
        { key: 'name' as keyof typeof dataWithNulls[0], header: 'Name' },
        { key: 'email' as keyof typeof dataWithNulls[0], header: 'Email' },
        { key: 'phone' as keyof typeof dataWithNulls[0], header: 'Phone' },
      ];

      const result = ExportService.toCSV(dataWithNulls, columns);
      
      const lines = result.split('\n');
      expect(lines[1]).toBe('John,,');
    });
  });

  describe('downloadCSV', () => {
    it('should create and trigger download', () => {
      const csvContent = 'Name,Email\nJohn,john@example.com';
      
      ExportService.downloadCSV(csvContent, 'test.csv');

      expect(global.Blob).toHaveBeenCalledWith([csvContent], { type: 'text/csv;charset=utf-8' });
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe('exportToCSV', () => {
    it('should convert data and trigger download', () => {
      const downloadSpy = jest.spyOn(ExportService, 'downloadCSV').mockImplementation();
      
      ExportService.exportToCSV(mockData, mockColumns, { filename: 'test.csv' });

      expect(downloadSpy).toHaveBeenCalledWith(
        expect.stringContaining('ID,Name,Email,Active'),
        'test.csv',
        undefined
      );
    });
  });

  describe('formatDateForCSV', () => {
    it('should format Date objects correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = ExportService.formatDateForCSV(date);
      expect(result).toBe('2024-01-15');
    });

    it('should format date strings correctly', () => {
      const result = ExportService.formatDateForCSV('2024-01-15T10:30:00Z');
      expect(result).toBe('2024-01-15');
    });

    it('should handle null and undefined dates', () => {
      expect(ExportService.formatDateForCSV(null)).toBe('');
      expect(ExportService.formatDateForCSV(undefined)).toBe('');
    });

    it('should handle invalid dates', () => {
      const result = ExportService.formatDateForCSV('invalid-date');
      expect(result).toBe('');
    });
  });

  describe('formatCurrencyForCSV', () => {
    it('should format numbers correctly', () => {
      expect(ExportService.formatCurrencyForCSV(1234.56)).toBe('1234.56');
      expect(ExportService.formatCurrencyForCSV(0)).toBe('0');
    });

    it('should handle null and undefined values', () => {
      expect(ExportService.formatCurrencyForCSV(null)).toBe('');
      expect(ExportService.formatCurrencyForCSV(undefined)).toBe('');
    });
  });

  describe('formatBooleanForCSV', () => {
    it('should format boolean values correctly', () => {
      expect(ExportService.formatBooleanForCSV(true)).toBe('Yes');
      expect(ExportService.formatBooleanForCSV(false)).toBe('No');
    });

    it('should handle null and undefined values', () => {
      expect(ExportService.formatBooleanForCSV(null)).toBe('');
      expect(ExportService.formatBooleanForCSV(undefined)).toBe('');
    });
  });
});