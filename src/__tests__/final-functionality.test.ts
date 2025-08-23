/**
 * Final Functionality Tests
 * Comprehensive tests for all contract-related functionality
 */

import { validationService } from '../services/shared/validation.service';
import { CreateContractDto, UpdateContractDto } from '../types/dto/contract.dto';
import { Contract, ContractStatus } from '../types/entities/contract.types';

// Mock Firebase
jest.mock('../lib/firebase', () => ({
  db: {},
  auth: {},
}));

describe('Final Contract Functionality Tests', () => {
  describe('Validation Service Functionality', () => {
    it('should validate contract creation with all required fields', () => {
      const validContract: CreateContractDto = {
        name: 'Test Contract',
        contractor: 'Test Contractor',
        client: 'Test Client',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 100000,
        scope: 'Test project scope',
      };

      const result = validationService.validateContractForCreation(validContract);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject contract creation with missing required fields', () => {
      const invalidContract: CreateContractDto = {
        name: '', // Invalid: empty name
        contractor: '', // Invalid: empty contractor
        client: 'Test Client',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 100000,
        scope: 'Test scope',
      };

      const result = validationService.validateContractForCreation(invalidContract);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.field === 'name')).toBe(true);
      expect(result.errors.some(error => error.field === 'contractor')).toBe(true);
    });

    it('should reject contract with invalid date range', () => {
      const invalidContract: CreateContractDto = {
        name: 'Test Contract',
        contractor: 'Test Contractor',
        client: 'Test Client',
        startDate: new Date('2024-12-31'), // End date before start date
        endDate: new Date('2024-01-01'),
        totalValue: 100000,
        scope: 'Test scope',
      };

      const result = validationService.validateContractForCreation(invalidContract);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.code === 'INVALID_DATE_RANGE')).toBe(true);
    });

    it('should reject contract with negative value', () => {
      const invalidContract: CreateContractDto = {
        name: 'Test Contract',
        contractor: 'Test Contractor',
        client: 'Test Client',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: -1000, // Invalid: negative value
        scope: 'Test scope',
      };

      const result = validationService.validateContractForCreation(invalidContract);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.field === 'totalValue')).toBe(true);
    });

    it('should validate contract updates with partial data', () => {
      const updateData: UpdateContractDto = {
        name: 'Updated Contract Name',
        totalValue: 150000,
      };

      const result = validationService.validateContractForUpdate(updateData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate status transitions correctly', () => {
      // Valid transition: 暫停中 -> 啟用中
      const validTransition = validationService.validateContractStatusTransition(
        "暫停中" as ContractStatus,
        "啟用中" as ContractStatus
      );
      expect(validTransition.isValid).toBe(true);

      // Invalid transition: 已完成 -> 暫停中 (cannot go back from completed)
      const invalidTransition = validationService.validateContractStatusTransition(
        "已完成" as ContractStatus,
        "暫停中" as ContractStatus
      );
      expect(invalidTransition.isValid).toBe(false);
    });

    it('should validate business rules for contracts', () => {
      const contract: Contract = {
        id: 'test-contract-1',
        customId: 'C001',
        name: 'Test Contract',
        contractor: 'Test Contractor',
        client: 'Test Client',
        clientRepresentative: 'John Doe',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // One year from now
        totalValue: 100000,
        status: "啟用中" as ContractStatus,
        scope: 'Test project scope',
        payments: [
          {
            id: 'payment-1',
            amount: 30000,
            status: "已付款",
            requestDate: new Date(),
          },
        ],
        changeOrders: [],
        versions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = validationService.validateContractBusinessRules(contract);
      expect(result.isValid).toBe(true);
    });

    it('should detect invalid business rules', () => {
      const contract: Contract = {
        id: 'test-contract-1',
        customId: 'C001',
        name: 'Test Contract',
        contractor: 'Test Contractor',
        client: 'Test Client',
        clientRepresentative: 'John Doe',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 100000,
        status: "啟用中" as ContractStatus,
        scope: 'Test project scope',
        payments: [
          {
            id: 'payment-1',
            amount: 150000, // Exceeds contract value
            status: "待處理",
            requestDate: new Date('2024-06-01'),
          },
        ],
        changeOrders: [],
        versions: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const result = validationService.validateContractBusinessRules(contract);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.code === 'PAYMENTS_EXCEED_CONTRACT_VALUE')).toBe(true);
    });
  });

  describe('Data Consistency and Validation', () => {
    it('should validate email formats correctly', () => {
      const validEmail = validationService.validateEmail('test@example.com');
      expect(validEmail.isValid).toBe(true);

      const invalidEmail = validationService.validateEmail('invalid-email');
      expect(invalidEmail.isValid).toBe(false);
    });

    it('should validate currency amounts correctly', () => {
      const validAmount = validationService.validateCurrency(1000.50, 'amount', '金額');
      expect(validAmount.isValid).toBe(true);

      const negativeAmount = validationService.validateCurrency(-100, 'amount', '金額', { allowNegative: false });
      expect(negativeAmount.isValid).toBe(false);

      const tooManyDecimals = validationService.validateCurrency(100.123, 'amount', '金額');
      expect(tooManyDecimals.isValid).toBe(false);
    });

    it('should validate Taiwan ID format correctly', () => {
      const validId = validationService.validateTaiwanId('A123456789');
      expect(validId.isValid).toBe(true);

      const invalidId = validationService.validateTaiwanId('invalid-id');
      expect(invalidId.isValid).toBe(false);
    });

    it('should validate business number format correctly', () => {
      const validNumber = validationService.validateBusinessNumber('12345675');
      expect(validNumber.isValid).toBe(true);

      const invalidNumber = validationService.validateBusinessNumber('1234567');
      expect(invalidNumber.isValid).toBe(false);
    });
  });

  describe('Performance and Efficiency', () => {
    it('should validate contracts efficiently', () => {
      const contractData: CreateContractDto = {
        name: 'Performance Test Contract',
        contractor: 'Test Contractor',
        client: 'Test Client',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 100000,
        scope: 'Test scope',
      };

      const start = performance.now();
      
      // Run validation multiple times
      for (let i = 0; i < 100; i++) {
        validationService.validateContractForCreation(contractData);
      }
      
      const end = performance.now();
      const duration = end - start;

      // Should complete 100 validations in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle complex validation rules efficiently', () => {
      const complexContract: Contract = {
        id: 'complex-contract',
        customId: 'C999',
        name: 'Complex Contract',
        contractor: 'Test Contractor',
        client: 'Test Client',
        clientRepresentative: 'John Doe',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 1000000,
        status: "啟用中" as ContractStatus,
        scope: 'Complex project scope',
        payments: Array.from({ length: 50 }, (_, index) => ({
          id: `payment-${index}`,
          amount: 10000,
          status: "待處理" as any,
          requestDate: new Date(),
        })),
        changeOrders: Array.from({ length: 20 }, (_, index) => ({
          id: `change-${index}`,
          title: `Change Order ${index}`,
          description: `Description ${index}`,
          status: "已核准" as any,
          date: new Date(),
          impact: {
            cost: 5000,
            scheduleDays: 5,
          },
        })),
        versions: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const start = performance.now();
      const result = validationService.validateContractBusinessRules(complexContract);
      const end = performance.now();

      expect(result).toBeDefined();
      expect(end - start).toBeLessThan(50); // Should complete within 50ms
    });

    it('should not cause memory leaks during repeated operations', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many validation operations
      for (let i = 0; i < 1000; i++) {
        validationService.validateContractForCreation({
          name: `Contract ${i}`,
          contractor: 'Test Contractor',
          client: 'Test Client',
          startDate: new Date(),
          endDate: new Date(),
          totalValue: 100000,
          scope: 'Test scope',
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle null and undefined values gracefully', () => {
      const result = validationService.validateRequired(null, 'testField', 'Test Field');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('REQUIRED_FIELD');
    });

    it('should handle empty strings appropriately', () => {
      const result = validationService.validateString('', 'name', '名稱', { required: true });
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('REQUIRED_FIELD');
    });

    it('should validate string length constraints', () => {
      const tooShort = validationService.validateString('ab', 'name', '名稱', { minLength: 3 });
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.errors[0].code).toBe('FIELD_TOO_SHORT');

      const tooLong = validationService.validateString('a'.repeat(101), 'name', '名稱', { maxLength: 100 });
      expect(tooLong.isValid).toBe(false);
      expect(tooLong.errors[0].code).toBe('FIELD_TOO_LONG');
    });

    it('should combine multiple validation results correctly', () => {
      const result1 = { isValid: true, errors: [] };
      const result2 = { isValid: false, errors: [{ field: 'test', message: 'error', code: 'TEST_ERROR' }] };
      
      const combined = validationService.combineResults(result1, result2);
      
      expect(combined.isValid).toBe(false);
      expect(combined.errors).toHaveLength(1);
    });
  });

  describe('Integration and Workflow Tests', () => {
    it('should support complete contract lifecycle validation', () => {
      // 1. Create contract
      const createData: CreateContractDto = {
        name: 'Lifecycle Test Contract',
        contractor: 'Test Contractor',
        client: 'Test Client',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 100000,
        scope: 'Lifecycle test scope',
      };

      const createResult = validationService.validateContractForCreation(createData);
      expect(createResult.isValid).toBe(true);

      // 2. Update contract
      const updateData: UpdateContractDto = {
        name: 'Updated Lifecycle Contract',
        totalValue: 150000,
      };

      const updateResult = validationService.validateContractForUpdate(updateData);
      expect(updateResult.isValid).toBe(true);

      // 3. Status transitions
      const statusTransition = validationService.validateContractStatusTransition(
        "暫停中" as ContractStatus,
        "啟用中" as ContractStatus
      );
      expect(statusTransition.isValid).toBe(true);
    });

    it('should validate contract scenarios correctly', () => {
      const contract: Contract = {
        id: 'scenario-contract',
        customId: 'SC001',
        name: 'Scenario Test Contract',
        contractor: 'Test Contractor',
        client: 'Test Client',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // One year from now
        totalValue: 100000,
        status: "啟用中" as ContractStatus,
        scope: 'Scenario test scope',
        payments: [
          {
            id: 'payment-1',
            amount: 50000,
            status: "已付款",
            requestDate: new Date(),
          },
        ],
        changeOrders: [],
        versions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Test creation scenario
      const creationResult = validationService.validateContractForScenario(contract, 'creation');
      expect(creationResult.isValid).toBe(true);

      // Test completion scenario
      const completionResult = validationService.validateContractForScenario(contract, 'completion');
      expect(completionResult.isValid).toBe(true);
    });
  });

  describe('Regression Tests', () => {
    it('should maintain backward compatibility with existing validation logic', () => {
      // Test that all existing validation methods still work as expected
      const methods = [
        () => validationService.validateRequired('test', 'field', 'Field'),
        () => validationService.validateString('test', 'field', 'Field'),
        () => validationService.validateEmail('test@example.com'),
        () => validationService.validateCurrency(100, 'amount', 'Amount'),
        () => validationService.validateTaiwanId('A123456789'),
        () => validationService.validateBusinessNumber('12345675'),
      ];

      methods.forEach(method => {
        expect(() => method()).not.toThrow();
        const result = method();
        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('errors');
      });
    });

    it('should not regress performance from baseline', () => {
      const contractData: CreateContractDto = {
        name: 'Performance Regression Test',
        contractor: 'Test Contractor',
        client: 'Test Client',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 100000,
        scope: 'Performance test scope',
      };

      const iterations = 50;
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        validationService.validateContractForCreation(contractData);
      }
      
      const end = performance.now();
      const averageTime = (end - start) / iterations;

      // Each validation should complete in under 2ms on average
      expect(averageTime).toBeLessThan(2);
    });
  });
});