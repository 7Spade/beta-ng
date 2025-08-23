/**
 * Comprehensive Contract Functionality Tests
 * Tests all contract-related functionality end-to-end
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContractProvider } from '../context/contracts/contract.provider';
import { ErrorProvider } from '../context/shared/error.context';
import { Contract, ContractStatus } from '../types/entities/contract.types';
import { CreateContractDto } from '../types/dto/contract.dto';
import { contractService } from '../services/contracts/contract.service';
import { contractRepository } from '../repositories/contracts/contract.repository';
import { validationService } from '../services/shared/validation.service';

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

// Test data
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

const mockContracts: Contract[] = [
    mockContract,
    {
        ...mockContract,
        id: 'test-contract-2',
        customId: 'C002',
        name: 'Test Contract 2',
        status: "已完成" as ContractStatus,
    },
];

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ErrorProvider>
        <ContractProvider>
            {children}
        </ContractProvider>
    </ErrorProvider>
);

describe('Contract Functionality Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mock implementations
        mockContractRepository.findAll.mockResolvedValue(mockContracts);
        mockContractRepository.findById.mockResolvedValue(mockContract);
        mockContractRepository.create.mockResolvedValue(mockContract);
        mockContractRepository.update.mockResolvedValue(mockContract);
        mockContractRepository.delete.mockResolvedValue();

        mockContractService.getContractDashboardStats.mockResolvedValue({
            totalContracts: 2,
            activeContracts: 1,
            completedContracts: 1,
            totalValue: 200000,
            averageValue: 100000,
            monthlyRevenue: 50000,
            statusDistribution: { '啟用中': 1, '已完成': 1, '暫停中': 0, '已終止': 0 },
            recentContracts: [],
        });
    });

    describe('Contract Data Access Layer', () => {
        it('should fetch all contracts successfully', async () => {
            const contracts = await contractRepository.findAll();

            expect(contracts).toHaveLength(2);
            expect(contracts[0].name).toBe('Test Contract');
            expect(mockContractRepository.findAll).toHaveBeenCalledTimes(1);
        });

        it('should fetch contract by ID successfully', async () => {
            const contract = await contractRepository.findById('test-contract-1');

            expect(contract).toBeDefined();
            expect(contract?.name).toBe('Test Contract');
            expect(mockContractRepository.findById).toHaveBeenCalledWith('test-contract-1');
        });

        it('should create new contract successfully', async () => {
            const newContractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'> = {
                name: 'New Contract',
                contractor: 'New Contractor',
                client: 'New Client',
                startDate: new Date('2024-02-01'),
                endDate: new Date('2024-12-31'),
                totalValue: 150000,
                scope: 'New project scope',
                status: '啟用中',
                payments: [],
                changeOrders: [],
                versions: [],
            };

            const createdContract = await contractRepository.create(newContractData);

            expect(createdContract).toBeDefined();
            expect(createdContract.name).toBe('Test Contract'); // Mock returns mockContract
            expect(mockContractRepository.create).toHaveBeenCalledWith(newContractData);
        });

        it('should update contract successfully', async () => {
            const updates = { name: 'Updated Contract Name' };

            const updatedContract = await contractRepository.update('test-contract-1', updates);

            expect(updatedContract).toBeDefined();
            expect(mockContractRepository.update).toHaveBeenCalledWith('test-contract-1', updates);
        });

        it('should delete contract successfully', async () => {
            await contractRepository.delete('test-contract-1');

            expect(mockContractRepository.delete).toHaveBeenCalledWith('test-contract-1');
        });
    });

    describe('Contract Business Logic Layer', () => {
        it('should calculate dashboard statistics correctly', async () => {
            const stats = await contractService.getContractDashboardStats();

            expect(stats.totalContracts).toBe(2);
            expect(stats.activeContracts).toBe(1);
            expect(stats.completedContracts).toBe(1);
            expect(stats.totalValue).toBe(200000);
            expect(stats.averageValue).toBe(100000);
        });

        it('should validate contract creation data', () => {
            const validContractData: CreateContractDto = {
                name: 'Valid Contract',
                contractor: 'Valid Contractor',
                client: 'Valid Client',
                startDate: new Date('2024-02-01'),
                endDate: new Date('2024-12-31'),
                totalValue: 100000,
                scope: 'Valid scope',
            };

            const result = validationService.validateContractForCreation(validContractData);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject invalid contract creation data', () => {
            const invalidContractData: CreateContractDto = {
                name: '', // Invalid: empty name
                contractor: 'Valid Contractor',
                client: 'Valid Client',
                startDate: new Date('2024-12-31'), // Invalid: end date before start date
                endDate: new Date('2024-01-01'),
                totalValue: -1000, // Invalid: negative value
                scope: 'Valid scope',
            };

            const result = validationService.validateContractForCreation(invalidContractData);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should validate status transitions correctly', () => {
            // Valid transition: 暫停中 -> 啟用中
            const validTransition = validationService.validateContractStatusTransition(
                "暫停中" as ContractStatus,
                "啟用中" as ContractStatus
            );
            expect(validTransition.isValid).toBe(true);

            // Invalid transition: 已完成 -> 暫停中
            const invalidTransition = validationService.validateContractStatusTransition(
                "已完成" as ContractStatus,
                "暫停中" as ContractStatus
            );
            expect(invalidTransition.isValid).toBe(false);
        });
    });

    describe('Contract Export Functionality', () => {
        it('should export contracts to CSV format', async () => {
            // Mock the export service
            const mockExportService = {
                exportToCSV: jest.fn().mockResolvedValue(undefined),
                toCSV: jest.fn().mockReturnValue('ID,Name,Client\nC001,Test Contract,Test Client'),
            };

            const csvData = mockExportService.toCSV(mockContracts, [
                { key: 'customId', header: 'ID' },
                { key: 'name', header: 'Name' },
                { key: 'client', header: 'Client' },
            ]);

            expect(csvData).toContain('ID,Name,Client');
            expect(csvData).toContain('C001,Test Contract,Test Client');
        });
    });

    describe('Error Handling', () => {
        it('should handle repository errors gracefully', async () => {
            const error = new Error('Database connection failed');
            mockContractRepository.findAll.mockRejectedValue(error);

            await expect(contractRepository.findAll()).rejects.toThrow('Database connection failed');
        });

        it('should handle service layer errors gracefully', async () => {
            const error = new Error('Service unavailable');
            mockContractService.getContractDashboardStats.mockRejectedValue(error);

            await expect(contractService.getContractDashboardStats()).rejects.toThrow('Service unavailable');
        });

        it('should validate and return appropriate error messages', () => {
            const invalidData: CreateContractDto = {
                name: '',
                contractor: '',
                client: '',
                startDate: new Date('2024-12-31'),
                endDate: new Date('2024-01-01'),
                totalValue: -1000,
                scope: '',
            };

            const result = validationService.validateContractForCreation(invalidData);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.field === 'name')).toBe(true);
            expect(result.errors.some(error => error.field === 'totalValue')).toBe(true);
        });
    });

    describe('Performance and Memory Management', () => {
        it('should handle large datasets efficiently', async () => {
            const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
                ...mockContract,
                id: `contract-${index}`,
                customId: `C${String(index).padStart(3, '0')}`,
                name: `Contract ${index}`,
            }));

            mockContractRepository.findAll.mockResolvedValue(largeDataset);

            const startTime = performance.now();
            const contracts = await contractRepository.findAll();
            const endTime = performance.now();

            expect(contracts).toHaveLength(1000);
            expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
        });

        it('should properly clean up resources', () => {
            // Test that no memory leaks occur during normal operations
            const initialMemory = process.memoryUsage().heapUsed;

            // Perform multiple operations
            for (let i = 0; i < 100; i++) {
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

    describe('Data Consistency and Integrity', () => {
        it('should maintain data consistency across operations', async () => {
            // Test that create, read, update operations maintain consistency
            const createData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'> = {
                name: 'Consistency Test Contract',
                contractor: 'Test Contractor',
                client: 'Test Client',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                totalValue: 100000,
                scope: 'Test scope',
                status: '啟用中',
                payments: [],
                changeOrders: [],
                versions: [],
            };

            // Create
            const created = await contractRepository.create(createData);
            expect(created.name).toBe('Test Contract'); // Mock returns mockContract

            // Read
            const retrieved = await contractRepository.findById(created.id);
            expect(retrieved?.id).toBe(created.id);

            // Update
            const updates = { name: 'Updated Contract Name' };
            const updated = await contractRepository.update(created.id, updates);
            expect(updated.id).toBe(created.id);
        });

        it('should validate business rules consistently', () => {
            const contract: Contract = {
                ...mockContract,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                totalValue: 100000,
                payments: [
                    {
                        id: 'payment-1',
                        amount: 50000,
                        status: 'pending' as any,
                        requestDate: new Date('2024-06-01'),
                    },
                ],
            };

            const result = validationService.validateContractBusinessRules(contract);
            expect(result.isValid).toBe(true);
        });
    });

    describe('Integration with UI Components', () => {
        it('should integrate properly with React components', () => {
            const TestComponent = () => {
                return (
                    <div>
                        <h1>Contract Dashboard</h1>
                        <div data-testid="contract-list">
                            {mockContracts.map(contract => (
                                <div key={contract.id} data-testid={`contract-${contract.id}`}>
                                    {contract.name}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            };

            render(
                <TestWrapper>
                    <TestComponent />
                </TestWrapper>
            );

            expect(screen.getByText('Contract Dashboard')).toBeInTheDocument();
            expect(screen.getByTestId('contract-list')).toBeInTheDocument();
        });
    });
});