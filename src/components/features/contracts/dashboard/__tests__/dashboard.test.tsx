/**
 * Contract Dashboard Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContractDashboard } from '../dashboard';
import { useContractDashboardStats } from '@/hooks/business/use-contract-stats';
import { DashboardStats } from '@/types/services/contract.service.types';
import { EnhancedError, ErrorSeverity, ErrorCategory } from '@/types/entities/error.types';

// Mock the hook
jest.mock('@/hooks/business/use-contract-stats');

// Mock the DashboardStats component
jest.mock('../../dashboard-stats', () => ({
  DashboardStats: ({ stats }: { stats: any }) => (
    <div data-testid="dashboard-stats">
      <div data-testid="total-contracts">{stats.totalContracts}</div>
      <div data-testid="active-contracts">{stats.active}</div>
      <div data-testid="completed-contracts">{stats.completed}</div>
      <div data-testid="total-value">{stats.totalValue}</div>
    </div>
  ),
}));

// Mock UI components
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

const mockUseContractDashboardStats = useContractDashboardStats as jest.MockedFunction<
  typeof useContractDashboardStats
>;

describe('ContractDashboard', () => {
  const mockStats: DashboardStats = {
    totalContracts: 10,
    activeContracts: 5,
    completedContracts: 3,
    totalValue: 1000000,
    averageValue: 100000,
    monthlyRevenue: 50000,
    statusDistribution: {
      '啟用中': 5,
      '已完成': 3,
      '暫停中': 2,
      '已終止': 0,
    },
    recentContracts: [],
  };

  // Helper function to create proper EnhancedError objects
  const createMockError = (code: string = 'FETCH_ERROR', message: string = 'Failed to fetch data'): EnhancedError => ({
    code,
    message,
    timestamp: new Date(),
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.NETWORK,
    name: 'FetchError',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show skeleton loading when data is loading', () => {
      mockUseContractDashboardStats.mockReturnValue({
        stats: null,
        loading: true,
        error: null,
        userMessage: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        clearError: jest.fn(),
      });

      render(<ContractDashboard />);

      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons).toHaveLength(4);
      expect(skeletons[0]).toHaveClass('h-28');
    });
  });

  describe('Error State', () => {
    it('should show error alert when there is an error', () => {
      const mockRefetch = jest.fn();
      const mockClearError = jest.fn();

      mockUseContractDashboardStats.mockReturnValue({
        stats: null,
        loading: false,
        error: createMockError(),
        userMessage: '無法載入儀表板資料，請稍後再試',
        refetch: mockRefetch,
        refresh: jest.fn(),
        clearError: mockClearError,
      });

      render(<ContractDashboard />);

      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert')).toHaveAttribute('data-variant', 'destructive');
      expect(screen.getByText('無法載入儀表板資料，請稍後再試')).toBeInTheDocument();
      expect(screen.getByText('關閉')).toBeInTheDocument();
      expect(screen.getByText('重試')).toBeInTheDocument();
    });

    it('should call clearError when close button is clicked', () => {
      const mockClearError = jest.fn();

      mockUseContractDashboardStats.mockReturnValue({
        stats: null,
        loading: false,
        error: createMockError(),
        userMessage: '無法載入儀表板資料，請稍後再試',
        refetch: jest.fn(),
        refresh: jest.fn(),
        clearError: mockClearError,
      });

      render(<ContractDashboard />);

      const closeButton = screen.getByText('關閉');
      closeButton.click();

      expect(mockClearError).toHaveBeenCalledTimes(1);
    });

    it('should call refetch when retry button is clicked', () => {
      const mockRefetch = jest.fn();

      mockUseContractDashboardStats.mockReturnValue({
        stats: null,
        loading: false,
        error: createMockError(),
        userMessage: '無法載入儀表板資料，請稍後再試',
        refetch: mockRefetch,
        refresh: jest.fn(),
        clearError: jest.fn(),
      });

      render(<ContractDashboard />);

      const retryButton = screen.getByText('重試');
      retryButton.click();

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('No Data State', () => {
    it('should show no data message when stats is null and no error', () => {
      mockUseContractDashboardStats.mockReturnValue({
        stats: null,
        loading: false,
        error: null,
        userMessage: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        clearError: jest.fn(),
      });

      render(<ContractDashboard />);

      expect(screen.getByText('無法載入儀表板統計資料')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render dashboard stats when data is loaded successfully', () => {
      mockUseContractDashboardStats.mockReturnValue({
        stats: mockStats,
        loading: false,
        error: null,
        userMessage: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        clearError: jest.fn(),
      });

      render(<ContractDashboard />);

      expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
      expect(screen.getByTestId('total-contracts')).toHaveTextContent('10');
      expect(screen.getByTestId('active-contracts')).toHaveTextContent('5');
      expect(screen.getByTestId('completed-contracts')).toHaveTextContent('3');
      expect(screen.getByTestId('total-value')).toHaveTextContent('1000000');
    });

    it('should transform DashboardStats to match component interface', () => {
      mockUseContractDashboardStats.mockReturnValue({
        stats: mockStats,
        loading: false,
        error: null,
        userMessage: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        clearError: jest.fn(),
      });

      render(<ContractDashboard />);

      // Verify that the stats are transformed correctly
      // totalContracts -> totalContracts
      // activeContracts -> active
      // completedContracts -> completed
      // totalValue -> totalValue
      expect(screen.getByTestId('total-contracts')).toHaveTextContent('10');
      expect(screen.getByTestId('active-contracts')).toHaveTextContent('5');
      expect(screen.getByTestId('completed-contracts')).toHaveTextContent('3');
      expect(screen.getByTestId('total-value')).toHaveTextContent('1000000');
    });
  });

  describe('Hook Configuration', () => {
    it('should call useContractDashboardStats with correct options', () => {
      mockUseContractDashboardStats.mockReturnValue({
        stats: mockStats,
        loading: false,
        error: null,
        userMessage: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        clearError: jest.fn(),
      });

      render(<ContractDashboard />);

      expect(mockUseContractDashboardStats).toHaveBeenCalledWith({
        autoFetch: true,
        refreshInterval: 5 * 60 * 1000, // 5 minutes
      });
    });
  });

  describe('Component Integration', () => {
    it('should not show loading or error states when data is available', () => {
      mockUseContractDashboardStats.mockReturnValue({
        stats: mockStats,
        loading: false,
        error: null,
        userMessage: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        clearError: jest.fn(),
      });

      render(<ContractDashboard />);

      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
      expect(screen.queryByText('無法載入儀表板統計資料')).not.toBeInTheDocument();
      expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
    });

    it('should handle edge case where stats has zero values', () => {
      const zeroStats: DashboardStats = {
        totalContracts: 0,
        activeContracts: 0,
        completedContracts: 0,
        totalValue: 0,
        averageValue: 0,
        monthlyRevenue: 0,
        statusDistribution: {
          '啟用中': 0,
          '已完成': 0,
          '暫停中': 0,
          '已終止': 0,
        },
        recentContracts: [],
      };

      mockUseContractDashboardStats.mockReturnValue({
        stats: zeroStats,
        loading: false,
        error: null,
        userMessage: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        clearError: jest.fn(),
      });

      render(<ContractDashboard />);

      expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
      expect(screen.getByTestId('total-contracts')).toHaveTextContent('0');
      expect(screen.getByTestId('active-contracts')).toHaveTextContent('0');
      expect(screen.getByTestId('completed-contracts')).toHaveTextContent('0');
      expect(screen.getByTestId('total-value')).toHaveTextContent('0');
    });
  });

  describe('Error Handling', () => {
    it('should not show error alert when error exists but userMessage is null', () => {
      mockUseContractDashboardStats.mockReturnValue({
        stats: null,
        loading: false,
        error: createMockError(),
        userMessage: null, // No user message
        refetch: jest.fn(),
        refresh: jest.fn(),
        clearError: jest.fn(),
      });

      render(<ContractDashboard />);

      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
      expect(screen.getByText('無法載入儀表板統計資料')).toBeInTheDocument();
    });

    it('should not show error alert when userMessage exists but error is null', () => {
      mockUseContractDashboardStats.mockReturnValue({
        stats: null,
        loading: false,
        error: null,
        userMessage: '某些錯誤訊息', // Has user message but no error
        refetch: jest.fn(),
        refresh: jest.fn(),
        clearError: jest.fn(),
      });

      render(<ContractDashboard />);

      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
      expect(screen.getByText('無法載入儀表板統計資料')).toBeInTheDocument();
    });
  });
});