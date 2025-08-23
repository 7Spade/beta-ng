/**
 * Contract Integration Tests
 * Tests the complete contract workflow from creation to completion
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContractProvider } from '../context/contracts/contract.provider';
import { ErrorProvider } from '../context/shared/error.context';
import { useContracts } from '../hooks/data/use-contracts';
import { useContractActions } from '../hooks/business/use-contract-actions';
import { useContractStats } from '../hooks/business/use-contract-stats';
import { Contract, ContractStatus } from '../types/entities/contract.types';
import { CreateContractDto } from '../types/dto/contract.dto';

// Mock Firebase
jest.mock('../lib/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock all the services and repositories
jest.mock('../services/contracts/contract.service');
jest.mock('../repositories/contracts/contract.repository');
jest.mock('../services/shared/validation.service');

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorProvider>
    <ContractProvider>
      {children}
    </ContractProvider>
  </ErrorProvider>
);

// Test component that uses all the hooks
const ContractTestComponent: React.FC = () => {
  const { contracts, loading, error, refetch } = useContracts();
  const { createContract, updateContract, deleteContract, exportToCSV } = useContractActions();
  const { stats, loading: statsLoading } = useContractStats();

  const handleCreateContract = async () => {
    const newContract: CreateContractDto = {
      name: 'Integration Test Contract',
      contractor: 'Test Contractor',
      client: 'Test Client',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      totalValue: 100000,
      scope: 'Integration test scope',
    };

    try {
      await createContract(newContract);
    } catch (error) {
      console.error('Failed to create contract:', error);
    }
  };

  const handleUpdateContract = async () => {
    if (contracts.length > 0) {
      try {
        await updateContract(contracts[0].id, { name: 'Updated Contract Name' });
      } catch (error) {
        console.error('Failed to update contract:', error);
      }
    }
  };

  const handleDeleteContract = async () => {
    if (contracts.length > 0) {
      try {
        await deleteContract(contracts[0].id);
      } catch (error) {
        console.error('Failed to delete contract:', error);
      }
    }
  };

  const handleExportContracts = async () => {
    try {
      await exportToCSV(contracts);
    } catch (error) {
      console.error('Failed to export contracts:', error);
    }
  };

  if (loading || statsLoading) {
    return <div data-testid="loading">Loading...</div>;
  }

  if (error) {
    return <div data-testid="error">Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Contract Integration Test</h1>
      
      {/* Statistics Display */}
      <div data-testid="stats">
        <div data-testid="total-contracts">Total: {stats?.totalContracts || 0}</div>
        <div data-testid="active-contracts">Active: {stats?.activeContracts || 0}</div>
        <div data-testid="total-value">Value: ${stats?.totalValue || 0}</div>
      </div>

      {/* Contract List */}
      <div data-testid="contract-list">
        {contracts.map(contract => (
          <div key={contract.id} data-testid={`contract-${contract.id}`}>
            <span data-testid={`contract-name-${contract.id}`}>{contract.name}</span>
            <span data-testid={`contract-status-${contract.id}`}>{contract.status}</span>
            <span data-testid={`contract-value-${contract.id}`}>${contract.totalValue}</span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div data-testid="actions">
        <button onClick={handleCreateContract} data-testid="create-button">
          Create Contract
        </button>
        <button onClick={handleUpdateContract} data-testid="update-button">
          Update Contract
        </button>
        <button onClick={handleDeleteContract} data-testid="delete-button">
          Delete Contract
        </button>
        <button onClick={handleExportContracts} data-testid="export-button">
          Export Contracts
        </button>
        <button onClick={refetch} data-testid="refresh-button">
          Refresh
        </button>
      </div>
    </div>
  );
};

describe('Contract Integration Tests', () => {
  const mockContracts: Contract[] = [
    {
      id: 'contract-1',
      customId: 'C001',
      name: 'Test Contract 1',
      contractor: 'Test Contractor 1',
      client: 'Test Client 1',
      clientRepresentative: 'John Doe',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      totalValue: 100000,
      status: "啟用中" as ContractStatus,
      scope: 'Test scope 1',
      payments: [],
      changeOrders: [],
      versions: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'contract-2',
      customId: 'C002',
      name: 'Test Contract 2',
      contractor: 'Test Contractor 2',
      client: 'Test Client 2',
      clientRepresentative: 'Jane Smith',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-12-31'),
      totalValue: 150000,
      status: "已完成" as ContractStatus,
      scope: 'Test scope 2',
      payments: [],
      changeOrders: [],
      versions: [],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the hooks to return test data
    (useContracts as jest.Mock).mockReturnValue({
      contracts: mockContracts,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    (useContractActions as jest.Mock).mockReturnValue({
      createContract: jest.fn().mockResolvedValue(mockContracts[0]),
      updateContract: jest.fn().mockResolvedValue(mockContracts[0]),
      deleteContract: jest.fn().mockResolvedValue(undefined),
      exportToCSV: jest.fn().mockResolvedValue(undefined),
    });

    (useContractStats as jest.Mock).mockReturnValue({
      stats: {
        totalContracts: 2,
        activeContracts: 1,
        completedContracts: 1,
        totalValue: 250000,
        averageValue: 125000,
        monthlyStats: [],
      },
      loading: false,
      error: null,
    });
  });

  it('should render contract dashboard with all components', () => {
    render(
      <TestWrapper>
        <ContractTestComponent />
      </TestWrapper>
    );

    // Check main elements
    expect(screen.getByText('Contract Integration Test')).toBeInTheDocument();
    expect(screen.getByTestId('stats')).toBeInTheDocument();
    expect(screen.getByTestId('contract-list')).toBeInTheDocument();
    expect(screen.getByTestId('actions')).toBeInTheDocument();

    // Check statistics
    expect(screen.getByTestId('total-contracts')).toHaveTextContent('Total: 2');
    expect(screen.getByTestId('active-contracts')).toHaveTextContent('Active: 1');
    expect(screen.getByTestId('total-value')).toHaveTextContent('Value: $250000');

    // Check contract list
    expect(screen.getByTestId('contract-contract-1')).toBeInTheDocument();
    expect(screen.getByTestId('contract-contract-2')).toBeInTheDocument();
    expect(screen.getByTestId('contract-name-contract-1')).toHaveTextContent('Test Contract 1');
    expect(screen.getByTestId('contract-status-contract-1')).toHaveTextContent('啟用中');
  });

  it('should handle contract creation workflow', async () => {
    const user = userEvent.setup();
    const mockCreateContract = jest.fn().mockResolvedValue(mockContracts[0]);
    
    (useContractActions as jest.Mock).mockReturnValue({
      createContract: mockCreateContract,
      updateContract: jest.fn(),
      deleteContract: jest.fn(),
      exportToCSV: jest.fn(),
    });

    render(
      <TestWrapper>
        <ContractTestComponent />
      </TestWrapper>
    );

    const createButton = screen.getByTestId('create-button');
    await user.click(createButton);

    await waitFor(() => {
      expect(mockCreateContract).toHaveBeenCalledWith({
        name: 'Integration Test Contract',
        contractor: 'Test Contractor',
        client: 'Test Client',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        totalValue: 100000,
        scope: 'Integration test scope',
      });
    });
  });

  it('should handle contract update workflow', async () => {
    const user = userEvent.setup();
    const mockUpdateContract = jest.fn().mockResolvedValue(mockContracts[0]);
    
    (useContractActions as jest.Mock).mockReturnValue({
      createContract: jest.fn(),
      updateContract: mockUpdateContract,
      deleteContract: jest.fn(),
      exportToCSV: jest.fn(),
    });

    render(
      <TestWrapper>
        <ContractTestComponent />
      </TestWrapper>
    );

    const updateButton = screen.getByTestId('update-button');
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateContract).toHaveBeenCalledWith('contract-1', {
        name: 'Updated Contract Name',
      });
    });
  });

  it('should handle contract deletion workflow', async () => {
    const user = userEvent.setup();
    const mockDeleteContract = jest.fn().mockResolvedValue(undefined);
    
    (useContractActions as jest.Mock).mockReturnValue({
      createContract: jest.fn(),
      updateContract: jest.fn(),
      deleteContract: mockDeleteContract,
      exportToCSV: jest.fn(),
    });

    render(
      <TestWrapper>
        <ContractTestComponent />
      </TestWrapper>
    );

    const deleteButton = screen.getByTestId('delete-button');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteContract).toHaveBeenCalledWith('contract-1');
    });
  });

  it('should handle contract export workflow', async () => {
    const user = userEvent.setup();
    const mockExportToCSV = jest.fn().mockResolvedValue(undefined);
    
    (useContractActions as jest.Mock).mockReturnValue({
      createContract: jest.fn(),
      updateContract: jest.fn(),
      deleteContract: jest.fn(),
      exportToCSV: mockExportToCSV,
    });

    render(
      <TestWrapper>
        <ContractTestComponent />
      </TestWrapper>
    );

    const exportButton = screen.getByTestId('export-button');
    await user.click(exportButton);

    await waitFor(() => {
      expect(mockExportToCSV).toHaveBeenCalledWith(mockContracts);
    });
  });

  it('should handle data refresh workflow', async () => {
    const user = userEvent.setup();
    const mockRefetch = jest.fn();
    
    (useContracts as jest.Mock).mockReturnValue({
      contracts: mockContracts,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(
      <TestWrapper>
        <ContractTestComponent />
      </TestWrapper>
    );

    const refreshButton = screen.getByTestId('refresh-button');
    await user.click(refreshButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should display loading state correctly', () => {
    (useContracts as jest.Mock).mockReturnValue({
      contracts: [],
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <ContractTestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error state correctly', () => {
    const testError = new Error('Test error message');
    
    (useContracts as jest.Mock).mockReturnValue({
      contracts: [],
      loading: false,
      error: testError,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <ContractTestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
  });

  it('should handle multiple concurrent operations', async () => {
    const user = userEvent.setup();
    const mockCreateContract = jest.fn().mockResolvedValue(mockContracts[0]);
    const mockUpdateContract = jest.fn().mockResolvedValue(mockContracts[0]);
    const mockExportToCSV = jest.fn().mockResolvedValue(undefined);
    
    (useContractActions as jest.Mock).mockReturnValue({
      createContract: mockCreateContract,
      updateContract: mockUpdateContract,
      deleteContract: jest.fn(),
      exportToCSV: mockExportToCSV,
    });

    render(
      <TestWrapper>
        <ContractTestComponent />
      </TestWrapper>
    );

    // Trigger multiple operations simultaneously
    const createButton = screen.getByTestId('create-button');
    const updateButton = screen.getByTestId('update-button');
    const exportButton = screen.getByTestId('export-button');

    await Promise.all([
      user.click(createButton),
      user.click(updateButton),
      user.click(exportButton),
    ]);

    await waitFor(() => {
      expect(mockCreateContract).toHaveBeenCalled();
      expect(mockUpdateContract).toHaveBeenCalled();
      expect(mockExportToCSV).toHaveBeenCalled();
    });
  });

  it('should maintain data consistency across operations', async () => {
    const user = userEvent.setup();
    let contractsState = [...mockContracts];
    
    const mockCreateContract = jest.fn().mockImplementation((newContract) => {
      const created = { ...mockContracts[0], ...newContract, id: 'new-contract' };
      contractsState.push(created);
      return Promise.resolve(created);
    });

    const mockUpdateContract = jest.fn().mockImplementation((id, updates) => {
      const index = contractsState.findIndex(c => c.id === id);
      if (index >= 0) {
        contractsState[index] = { ...contractsState[index], ...updates };
      }
      return Promise.resolve(contractsState[index]);
    });

    (useContractActions as jest.Mock).mockReturnValue({
      createContract: mockCreateContract,
      updateContract: mockUpdateContract,
      deleteContract: jest.fn(),
      exportToCSV: jest.fn(),
    });

    render(
      <TestWrapper>
        <ContractTestComponent />
      </TestWrapper>
    );

    // Create a contract
    const createButton = screen.getByTestId('create-button');
    await user.click(createButton);

    // Update the first contract
    const updateButton = screen.getByTestId('update-button');
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockCreateContract).toHaveBeenCalled();
      expect(mockUpdateContract).toHaveBeenCalled();
      expect(contractsState).toHaveLength(3); // Original 2 + 1 new
    });
  });
});