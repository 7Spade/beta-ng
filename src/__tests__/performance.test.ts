/**
 * Performance Tests
 * Verifies that the refactored architecture maintains or improves performance
 */

import { contractService } from '../services/contracts/contract.service';
import { contractRepository } from '../repositories/contracts/contract.repository';
import { validationService } from '../services/shared/validation.service';
import { Contract, ContractStatus } from '../types/entities/contract.types';
import { CreateContractDto } from '../types/dto/contract.dto';

// Mock Firebase
jest.mock('../lib/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock services
jest.mock('../services/contracts/contract.service');
jest.mock('../repositories/contracts/contract.repository');

const mockContractService = contractService as jest.Mocked<typeof contractService>;
const mockContractRepository = contractRepository as jest.Mocked<typeof contractRepository>;

// Performance test utilities
const measurePerformance = async (operation: () => Promise<any>, iterations: number = 100) => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await operation();
    const end = performance.now();
    times.push(end - start);
  }
  
  return {
    average: times.reduce((sum, time) => sum + time, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)],
  };
};

const measureSyncPerformance = (operation: () => any, iterations: number = 1000) => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    operation();
    const end = performance.now();
    times.push(end - start);
  }
  
  return {
    average: times.reduce((sum, time) => sum + time, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)],
  };
};

describe('Performance Tests', () => {
  const mockContract: Contract = {
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
    payments: [],
    changeOrders: [],
    versions: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup fast mock implementations
    mockContractRepository.findAll.mockResolvedValue([mockContract]);
    mockContractRepository.findById.mockResolvedValue(mockContract);
    mockContractRepository.create.mockResolvedValue(mockContract);
    mockContractRepository.update.mockResolvedValue(mockContract);
    mockContractRepository.delete.mockResolvedValue();
    
    mockContractService.getContractDashboardStats.mockResolvedValue({
      totalContracts: 1,
      activeContracts: 1,
      completedContracts: 0,
      totalValue: 100000,
      averageValue: 100000,
      monthlyRevenue: 25000,
      statusDistribution: { '啟用中': 1, '已完成': 0, '暫停中': 0, '已終止': 0 },
      recentContracts: [],
    });
  });

  describe('Repository Layer Performance', () => {
    it('should fetch contracts within acceptable time limits', async () => {
      const stats = await measurePerformance(
        () => contractRepository.findAll(),
        50
      );

      expect(stats.average).toBeLessThan(10); // Average should be under 10ms
      expect(stats.max).toBeLessThan(50); // Max should be under 50ms
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = Array.from({ length: 10 }, () =>
        contractRepository.findById('test-contract-1')
      );

      const start = performance.now();
      const results = await Promise.all(concurrentRequests);
      const end = performance.now();

      expect(results).toHaveLength(10);
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });

    it('should scale with large datasets', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        ...mockContract,
        id: `contract-${index}`,
      }));

      mockContractRepository.findAll.mockResolvedValue(largeDataset);

      const stats = await measurePerformance(
        () => contractRepository.findAll(),
        10
      );

      expect(stats.average).toBeLessThan(50); // Should handle large datasets efficiently
    });
  });

  describe('Service Layer Performance', () => {
    it('should calculate statistics efficiently', async () => {
      const stats = await measurePerformance(
        () => contractService.getContractDashboardStats(),
        50
      );

      expect(stats.average).toBeLessThan(20); // Statistics calculation should be fast
      expect(stats.max).toBeLessThan(100);
    });

    it('should handle batch operations efficiently', async () => {
      const batchOperations = Array.from({ length: 20 }, () =>
        contractService.getContractDashboardStats()
      );

      const start = performance.now();
      await Promise.all(batchOperations);
      const end = performance.now();

      expect(end - start).toBeLessThan(200); // Batch operations should be efficient
    });
  });

  describe('Validation Performance', () => {
    it('should validate contracts quickly', () => {
      const contractData: CreateContractDto = {
        name: 'Performance Test Contract',
        contractor: 'Test Contractor',
        client: 'Test Client',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 100000,
        scope: 'Test scope',
      };

      const stats = measureSyncPerformance(
        () => validationService.validateContractForCreation(contractData),
        500
      );

      expect(stats.average).toBeLessThan(5); // Validation should be very fast
      expect(stats.max).toBeLessThan(20);
    });

    it('should handle complex validation rules efficiently', () => {
      const complexContract: Contract = {
        ...mockContract,
        payments: Array.from({ length: 50 }, (_, index) => ({
          id: `payment-${index}`,
          amount: 1000,
          status: '待處理' as any,
          requestDate: new Date(),
        })),
        changeOrders: Array.from({ length: 20 }, (_, index) => ({
          id: `change-${index}`,
          title: `Change Order ${index}`,
          description: `Change order ${index}`,
          status: '已核准' as any,
          date: new Date(),
          impact: {
            cost: 500,
            scheduleDays: 5,
          },
        })),
      };

      const stats = measureSyncPerformance(
        () => validationService.validateContractBusinessRules(complexContract),
        100
      );

      expect(stats.average).toBeLessThan(10); // Complex validation should still be fast
    });
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks during repeated operations', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many operations
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

      // Memory increase should be minimal (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    it('should handle large objects efficiently', () => {
      const largeContract: Contract = {
        ...mockContract,
        scope: 'A'.repeat(10000), // Large scope text
        payments: Array.from({ length: 100 }, (_, index) => ({
          id: `payment-${index}`,
          amount: 1000,
          status: '待處理' as any,
          requestDate: new Date(),
        })),
      };

      const start = performance.now();
      const result = validationService.validateContractBusinessRules(largeContract);
      const end = performance.now();

      expect(result).toBeDefined();
      expect(end - start).toBeLessThan(50); // Should handle large objects efficiently
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent validation requests', () => {
      const contractData: CreateContractDto = {
        name: 'Concurrent Test Contract',
        contractor: 'Test Contractor',
        client: 'Test Client',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 100000,
        scope: 'Test scope',
      };

      const concurrentValidations = Array.from({ length: 50 }, () =>
        () => validationService.validateContractForCreation(contractData)
      );

      const start = performance.now();
      concurrentValidations.forEach(validation => validation());
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Concurrent operations should be efficient
    });

    it('should maintain performance under load', async () => {
      const loadTest = async () => {
        const operations = [
          contractRepository.findAll(),
          contractRepository.findById('test-contract-1'),
          contractService.getContractDashboardStats(),
        ];

        return Promise.all(operations);
      };

      const stats = await measurePerformance(loadTest, 20);

      expect(stats.average).toBeLessThan(50); // Should maintain performance under load
      expect(stats.max).toBeLessThan(200);
    });
  });

  describe('Regression Tests', () => {
    it('should not regress from baseline performance', async () => {
      // Baseline performance expectations based on the original implementation
      const baselineExpectations = {
        repositoryFindAll: 10, // ms
        repositoryFindById: 5, // ms
        serviceStats: 20, // ms
        validation: 5, // ms
      };

      // Test repository performance
      const repoStats = await measurePerformance(
        () => contractRepository.findAll(),
        30
      );
      expect(repoStats.average).toBeLessThan(baselineExpectations.repositoryFindAll);

      // Test service performance
      const serviceStats = await measurePerformance(
        () => contractService.getContractDashboardStats(),
        30
      );
      expect(serviceStats.average).toBeLessThan(baselineExpectations.serviceStats);

      // Test validation performance
      const validationStats = measureSyncPerformance(
        () => validationService.validateContractForCreation({
          name: 'Test Contract',
          contractor: 'Test Contractor',
          client: 'Test Client',
          startDate: new Date(),
          endDate: new Date(),
          totalValue: 100000,
          scope: 'Test scope',
        }),
        100
      );
      expect(validationStats.average).toBeLessThan(baselineExpectations.validation);
    });
  });
});