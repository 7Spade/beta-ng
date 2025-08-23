import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContractsTable } from '../contracts-table';
import type { Contract } from '@/types/entities/contract.types';

// Mock all the dependencies
jest.mock('@/hooks/business/use-contract-actions');
jest.mock('@/hooks/ui/use-table-state');
jest.mock('@/lib/utils', () => ({
  formatDate: jest.fn((date: Date) => date.toLocaleDateString()),
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Download: () => <div data-testid="download-icon" />,
    MoreHorizontal: () => <div data-testid="more-horizontal-icon" />,
    Eye: () => <div data-testid="eye-icon" />,
}));

// Mock UI components
jest.mock('@/components/ui/table', () => ({
  Table: ({ children, ...props }: any) => <table {...props}>{children}</table>,
  TableHeader: ({ children, ...props }: any) => <thead {...props}>{children}</thead>,
  TableBody: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
  TableRow: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  TableHead: ({ children, ...props }: any) => <th {...props}>{children}</th>,
  TableCell: ({ children, ...props }: any) => <td {...props}>{children}</td>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  CardDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <div data-variant={variant} {...props}>{children}</div>
  ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild, ...props }: any) => {
    const handleClick = (e: any) => {
      e.stopPropagation(); // Prevent event bubbling
      if (props.onClick) props.onClick(e);
    };
    return asChild ? React.cloneElement(children, { ...props, onClick: handleClick }) : <div {...props} onClick={handleClick}>{children}</div>;
  },
  DropdownMenuContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DropdownMenuItem: ({ children, onSelect, ...props }: any) => (
    <div onClick={onSelect} {...props}>{children}</div>
  ),
}));

// Mock the ContractDetailsSheet
jest.mock('../../contracts-details-sheet', () => ({
  ContractDetailsSheet: ({ contract, isOpen, onOpenChange }: any) => (
    isOpen ? (
      <div data-testid="contract-details-sheet">
        <h2>Contract Details: {contract.name}</h2>
        <p>Contractor: {contract.contractor}</p>
        <p>Value: ${contract.totalValue.toLocaleString()}</p>
        <button onClick={() => onOpenChange(false)}>Close Sheet</button>
      </div>
    ) : null
  ),
}));

const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    name: '大型建設專案',
    contractor: 'ABC建設公司',
    client: '市政府',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    totalValue: 5000000,
    status: '啟用中',
    scope: '道路建設',
    payments: [],
    changeOrders: [],
    versions: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'contract-2',
    name: '住宅開發案',
    contractor: 'XYZ營造',
    client: '私人開發商',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-02-28'),
    totalValue: 8000000,
    status: '暫停中',
    scope: '住宅建設',
    payments: [],
    changeOrders: [],
    versions: [],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
];

describe('ContractsTable Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    const { useContractExport } = require('@/hooks/business/use-contract-actions');
    useContractExport.mockReturnValue({
      exportToCSV: jest.fn().mockResolvedValue(undefined),
      exporting: false,
      exportError: null,
    });

    const { useTableState } = require('@/hooks/ui/use-table-state');
    useTableState.mockReturnValue({
      getProcessedData: jest.fn((data) => data),
    });
  });

  it('renders complete table with all contract information', () => {
    render(<ContractsTable contracts={mockContracts} />);

    // Check table structure
    expect(screen.getByText('合約')).toBeInTheDocument();
    expect(screen.getByText('所有進行中和已完成的營造合約總覽。')).toBeInTheDocument();

    // Check contract data
    expect(screen.getByText('大型建設專案')).toBeInTheDocument();
    expect(screen.getByText('ABC建設公司')).toBeInTheDocument();
    expect(screen.getByText('$5,000,000')).toBeInTheDocument();
    expect(screen.getByText('啟用中')).toBeInTheDocument();

    expect(screen.getByText('住宅開發案')).toBeInTheDocument();
    expect(screen.getByText('XYZ營造')).toBeInTheDocument();
    expect(screen.getByText('$8,000,000')).toBeInTheDocument();
    expect(screen.getByText('暫停中')).toBeInTheDocument();
  });

  it('handles complete user interaction flow', async () => {
    const mockExportToCSV = jest.fn().mockResolvedValue(undefined);
    const { useContractExport } = require('@/hooks/business/use-contract-actions');
    useContractExport.mockReturnValue({
      exportToCSV: mockExportToCSV,
      exporting: false,
      exportError: null,
    });

    render(<ContractsTable contracts={mockContracts} />);

    // 1. Test export functionality
    const exportButton = screen.getByRole('button', { name: /匯出 CSV/i });
    fireEvent.click(exportButton);

    expect(mockExportToCSV).toHaveBeenCalledWith(mockContracts, {
      format: 'csv',
      filename: 'contracts_export.csv',
      includePayments: false,
      includeChangeOrders: false,
    });

    // 2. Test contract details interaction
    const firstContractRow = screen.getByText('大型建設專案').closest('tr');
    fireEvent.click(firstContractRow!);

    // Wait for details sheet to appear
    await waitFor(() => {
      expect(screen.getByTestId('contract-details-sheet')).toBeInTheDocument();
      expect(screen.getByText('Contract Details: 大型建設專案')).toBeInTheDocument();
      expect(screen.getByText('Contractor: ABC建設公司')).toBeInTheDocument();
      expect(screen.getByText('Value: $5,000,000')).toBeInTheDocument();
    });

    // 3. Test closing the details sheet
    const closeButton = screen.getByText('Close Sheet');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('contract-details-sheet')).not.toBeInTheDocument();
    });
  });

  it('handles export error states correctly', () => {
    const mockError = { message: '網路連線錯誤' };
    const { useContractExport } = require('@/hooks/business/use-contract-actions');
    useContractExport.mockReturnValue({
      exportToCSV: jest.fn(),
      exporting: false,
      exportError: mockError,
    });

    render(<ContractsTable contracts={mockContracts} />);

    // Error message should be displayed
    expect(screen.getByText('匯出失敗: 網路連線錯誤')).toBeInTheDocument();
  });

  it('handles export loading states correctly', () => {
    const { useContractExport } = require('@/hooks/business/use-contract-actions');
    useContractExport.mockReturnValue({
      exportToCSV: jest.fn(),
      exporting: true,
      exportError: null,
    });

    render(<ContractsTable contracts={mockContracts} />);

    // Export button should show loading state
    const exportButton = screen.getByRole('button', { name: /匯出中.../i });
    expect(exportButton).toBeDisabled();
  });

  it('integrates with table state management', () => {
    const mockGetProcessedData = jest.fn((data) => data.slice(0, 1)); // Return only first contract
    const { useTableState } = require('@/hooks/ui/use-table-state');
    useTableState.mockReturnValue({
      getProcessedData: mockGetProcessedData,
    });

    render(<ContractsTable contracts={mockContracts} />);

    // Verify table state hook was called with correct options
    expect(useTableState).toHaveBeenCalledWith({
      defaultPageSize: 10,
    });

    // Verify processed data is used
    expect(mockGetProcessedData).toHaveBeenCalledWith(mockContracts);

    // Only first contract should be visible (due to our mock)
    expect(screen.getByText('大型建設專案')).toBeInTheDocument();
    expect(screen.queryByText('住宅開發案')).not.toBeInTheDocument();
  });

  it('handles dropdown menu interactions without triggering row clicks', async () => {
    render(<ContractsTable contracts={mockContracts} />);

    // Find the dropdown trigger for the first contract
    const firstRow = screen.getByText('大型建設專案').closest('tr');
    const dropdownTrigger = firstRow!.querySelector('button[aria-haspopup="true"]');
    
    fireEvent.click(dropdownTrigger!);

    // Details sheet should not open from dropdown click
    expect(screen.queryByTestId('contract-details-sheet')).not.toBeInTheDocument();

    // Now click the "查看詳情" menu item (get the first one)
    const viewDetailsItems = screen.getAllByText('查看詳情');
    fireEvent.click(viewDetailsItems[0]);

    // Now the details sheet should open
    await waitFor(() => {
      expect(screen.getByTestId('contract-details-sheet')).toBeInTheDocument();
    });
  });

  it('handles multiple contract interactions correctly', async () => {
    render(<ContractsTable contracts={mockContracts} />);

    // Click first contract
    const firstContractRow = screen.getByText('大型建設專案').closest('tr');
    fireEvent.click(firstContractRow!);

    await waitFor(() => {
      expect(screen.getByText('Contract Details: 大型建設專案')).toBeInTheDocument();
    });

    // Close first contract details
    fireEvent.click(screen.getByText('Close Sheet'));

    await waitFor(() => {
      expect(screen.queryByTestId('contract-details-sheet')).not.toBeInTheDocument();
    });

    // Click second contract
    const secondContractRow = screen.getByText('住宅開發案').closest('tr');
    fireEvent.click(secondContractRow!);

    await waitFor(() => {
      expect(screen.getByText('Contract Details: 住宅開發案')).toBeInTheDocument();
    });
  });
});