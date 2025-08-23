/**
 * Contract Statistics Service Tests
 */

import { ContractStatsService } from '../contract-stats.service';
import { Contract } from '../../../types/entities/contract.types';

// Mock contract repository
const mockContractRepository = {
  findAll: jest.fn(),
} as any;

describe('ContractStatsService', () => {
  let service: ContractStatsService;
  let mockContracts: Contract[];

  beforeEach(() => {
    service = new ContractStatsService(mockContractRepository);
    
    // Create mock contracts for testing
    mockContracts = [
      {
        id: '1',
        name: 'Contract 1',
        contractor: 'Contractor A',
        client: 'Client A',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 100000,
        status: '啟用中',
        scope: 'Test scope',
        payments: [
          {
            id: 'p1',
            amount: 50000,
            requestDate: new Date('2024-01-15'),
            paidDate: new Date('2024-01-20'),
            status: '已付款'
          }
        ],
        changeOrders: [],
        versions: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'Contract 2',
        contractor: 'Contractor B',
        client: 'Client B',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-11-30'),
        totalValue: 200000,
        status: '已完成',
        scope: 'Test scope 2',
        payments: [],
        changeOrders: [
          {
            id: 'co1',
            title: 'Additional Work Order',
            description: 'Additional work',
            date: new Date('2024-03-01'),
            impact: { cost: 25000, scheduleDays: 30 },
            status: '已核准'
          }
        ],
        versions: [],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      },
      {
        id: '3',
        name: 'Contract 3',
        contractor: 'Contractor A',
        client: 'Client A',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
        totalValue: 150000,
        status: '暫停中',
        scope: 'Test scope 3',
        payments: [],
        changeOrders: [],
        versions: [],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
      }
    ];

    mockContractRepository.findAll.mockResolvedValue(mockContracts);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateContractValue', () => {
    it('should calculate contract value without change orders', () => {
      const contract = mockContracts[0];
      const value = service.calculateContractValue(contract);
      expect(value).toBe(100000);
    });

    it('should calculate contract value with approved change orders', () => {
      const contract = mockContracts[1];
      const value = service.calculateContractValue(contract);
      expect(value).toBe(225000); // 200000 + 25000
    });

    it('should ignore non-approved change orders', () => {
      const contractWithPendingChangeOrder = {
        ...mockContracts[0],
        changeOrders: [
          {
            id: 'co2',
            title: 'Pending Work Order',
            description: 'Pending work',
            date: new Date('2024-03-01'),
            impact: { cost: 10000, scheduleDays: 15 },
            status: '待處理' as const
          }
        ]
      };
      
      const value = service.calculateContractValue(contractWithPendingChangeOrder);
      expect(value).toBe(100000); // Should not include pending change order
    });
  });

  describe('getStatusDistribution', () => {
    it('should return correct status distribution', () => {
      const distribution = service.getStatusDistribution(mockContracts);
      
      expect(distribution).toEqual({
        '啟用中': 1,
        '已完成': 1,
        '暫停中': 1,
        '已終止': 0,
      });
    });

    it('should handle empty contracts array', () => {
      const distribution = service.getStatusDistribution([]);
      
      expect(distribution).toEqual({
        '啟用中': 0,
        '已完成': 0,
        '暫停中': 0,
        '已終止': 0,
      });
    });
  });

  describe('getRecentContracts', () => {
    it('should return contracts sorted by creation date', () => {
      const recent = service.getRecentContracts(mockContracts, 2);
      
      expect(recent).toHaveLength(2);
      expect(recent[0].id).toBe('3'); // Most recent
      expect(recent[1].id).toBe('2');
    });

    it('should respect the limit parameter', () => {
      const recent = service.getRecentContracts(mockContracts, 1);
      
      expect(recent).toHaveLength(1);
      expect(recent[0].id).toBe('3');
    });
  });

  describe('getContractDashboardStats', () => {
    it('should return comprehensive dashboard statistics', async () => {
      const stats = await service.getContractDashboardStats();
      
      expect(stats.totalContracts).toBe(3);
      expect(stats.activeContracts).toBe(1);
      expect(stats.completedContracts).toBe(1);
      expect(stats.totalValue).toBe(475000); // 100000 + 225000 + 150000
      expect(stats.averageValue).toBe(158333.33333333334); // 475000 / 3
      expect(stats.statusDistribution).toEqual({
        '啟用中': 1,
        '已完成': 1,
        '暫停中': 1,
        '已終止': 0,
      });
      expect(stats.recentContracts).toHaveLength(3);
    });

    it('should handle repository errors', async () => {
      mockContractRepository.findAll.mockRejectedValue(new Error('Database error'));
      
      await expect(service.getContractDashboardStats()).rejects.toThrow('Failed to get dashboard statistics');
    });
  });

  describe('calculateMonthlyRevenue', () => {
    it('should calculate revenue from payments in current month', () => {
      // Mock current date to be in January 2024
      const mockDate = new Date('2024-01-25');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      const revenue = service.calculateMonthlyRevenue(mockContracts);
      
      // Should include the payment from contract 1 (50000) made in January 2024
      expect(revenue).toBeGreaterThan(0);
      
      // Restore Date
      (global.Date as any).mockRestore();
    });
  });

  describe('getTopClientsByValue', () => {
    it('should return top clients by total contract value', () => {
      const topClients = service.getTopClientsByValue(mockContracts, 2);
      
      expect(topClients).toHaveLength(2);
      expect(topClients[0].client).toBe('Client A'); // 100000 + 150000 = 250000
      expect(topClients[0].totalValue).toBe(250000);
      expect(topClients[0].contractCount).toBe(2);
      
      expect(topClients[1].client).toBe('Client B'); // 225000
      expect(topClients[1].totalValue).toBe(225000);
      expect(topClients[1].contractCount).toBe(1);
    });
  });
});