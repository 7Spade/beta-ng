/**
 * Contract Export Service Tests
 */

import { ContractExportService } from '../contract-export.service';
import { ExportService } from '../../shared/export.service';
import { Contract, ContractStatus } from '@/types/entities/contract.types';

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

describe('ContractExportService', () => {
  const mockContracts: Contract[] = [
    {
      id: '1',
      customId: 'C001',
      name: 'Test Contract 1',
      contractor: 'Test Contractor',
      client: 'Test Client',
      clientRepresentative: 'John Doe',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      totalValue: 100000,
      status: '啟用中' as ContractStatus,
      scope: 'Test scope',
      payments: [
        {
          id: 'p1',
          amount: 50000,
          status: '已付款',
          requestDate: new Date('2024-06-01'),
          paidDate: new Date('2024-06-15'),
        },
      ],
      changeOrders: [
        {
          id: 'co1',
          title: 'Change Order 1',
          description: 'Test change order',
          status: '已核准',
          date: new Date('2024-03-01'),
          impact: {
            cost: 5000,
            scheduleDays: 10,
          },
        },
      ],
      versions: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportContractsToCSV', () => {
    it('should export contracts to CSV format', () => {
      const exportSpy = jest.spyOn(ExportService, 'exportToCSV').mockImplementation();

      ContractExportService.exportContractsToCSV(mockContracts);

      expect(exportSpy).toHaveBeenCalledWith(
        mockContracts,
        expect.any(Array),
        expect.objectContaining({
          filename: 'contracts_export.csv',
        })
      );
    });

    it('should filter contracts by status when statusFilter is provided', () => {
      const exportSpy = jest.spyOn(ExportService, 'exportToCSV').mockImplementation();

      ContractExportService.exportContractsToCSV(mockContracts, {
        statusFilter: ['已完成'],
      });

      expect(exportSpy).toHaveBeenCalledWith(
        [], // Should be empty since no contracts match the filter
        expect.any(Array),
        expect.any(Object)
      );
    });

    it('should use custom filename when provided', () => {
      const exportSpy = jest.spyOn(ExportService, 'exportToCSV').mockImplementation();

      ContractExportService.exportContractsToCSV(mockContracts, {
        filename: 'custom_export.csv',
      });

      expect(exportSpy).toHaveBeenCalledWith(
        mockContracts,
        expect.any(Array),
        expect.objectContaining({
          filename: 'custom_export.csv',
        })
      );
    });
  });

  describe('exportContractsWithPayments', () => {
    it('should export contracts with payment details', () => {
      const exportSpy = jest.spyOn(ExportService, 'exportToCSV').mockImplementation();

      ContractExportService.exportContractsWithPayments(mockContracts);

      expect(exportSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            contractId: '1',
            contractName: 'Test Contract 1',
            paymentId: 'p1',
            paymentAmount: 50000,
          }),
        ]),
        expect.any(Array),
        expect.objectContaining({
          filename: 'contracts_with_payments_export.csv',
        })
      );
    });
  });

  describe('exportContractsWithChangeOrders', () => {
    it('should export contracts with change order details', () => {
      const exportSpy = jest.spyOn(ExportService, 'exportToCSV').mockImplementation();

      ContractExportService.exportContractsWithChangeOrders(mockContracts);

      expect(exportSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            contractId: '1',
            contractName: 'Test Contract 1',
            changeOrderId: 'co1',
            changeOrderTitle: 'Change Order 1',
          }),
        ]),
        expect.any(Array),
        expect.objectContaining({
          filename: 'contracts_with_change_orders_export.csv',
        })
      );
    });
  });

  describe('exportContractSummary', () => {
    it('should export contract summary with calculated statistics', () => {
      const exportSpy = jest.spyOn(ExportService, 'exportToCSV').mockImplementation();

      ContractExportService.exportContractSummary(mockContracts);

      expect(exportSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            name: 'Test Contract 1',
            totalPayments: 1,
            paidAmount: 50000,
            totalChangeOrders: 1,
            changeOrderCostImpact: 5000,
          }),
        ]),
        expect.any(Array),
        expect.objectContaining({
          filename: 'contract_summary_export.csv',
        })
      );
    });
  });
});