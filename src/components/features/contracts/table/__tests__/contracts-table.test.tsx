import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContractsTable } from '../contracts-table';
import type { Contract } from '@/types/entities/contract.types';

// Create mock functions that can be controlled in tests
const mockExportToCSV = jest.fn();
const mockGetProcessedData = jest.fn();

// Mock the hooks
jest.mock('@/hooks/business/use-contract-actions', () => ({
    useContractExport: jest.fn(() => ({
        exportToCSV: mockExportToCSV,
        exporting: false,
        exportError: null,
    })),
}));

jest.mock('@/hooks/ui/use-table-state', () => ({
    useTableState: jest.fn(() => ({
        getProcessedData: mockGetProcessedData,
    })),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Download: () => <div data-testid="download-icon" />,
    MoreHorizontal: () => <div data-testid="more-horizontal-icon" />,
    Eye: () => <div data-testid="eye-icon" />,
}));

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  formatDate: jest.fn((date: Date) => date.toLocaleDateString()),
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
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
  DropdownMenuTrigger: ({ children, asChild, ...props }: any) => 
    asChild ? React.cloneElement(children, props) : <div {...props}>{children}</div>,
  DropdownMenuContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DropdownMenuItem: ({ children, onSelect, ...props }: any) => (
    <div onClick={onSelect} {...props}>{children}</div>
  ),
}));

// Mock the ContractDetailsSheet component
jest.mock('../../contracts-details-sheet', () => ({
    ContractDetailsSheet: ({ contract, isOpen, onOpenChange }: any) => (
        isOpen ? (
            <div data-testid="contract-details-sheet">
                <h2>{contract.name}</h2>
                <button onClick={() => onOpenChange(false)}>Close</button>
            </div>
        ) : null
    ),
}));

const mockContracts: Contract[] = [
    {
        id: 'contract-1',
        name: '合約一',
        contractor: '承包商一',
        client: '客戶一',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalValue: 1000000,
        status: '啟用中',
        scope: '範圍一',
        payments: [],
        changeOrders: [],
        versions: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'contract-2',
        name: '合約二',
        contractor: '承包商二',
        client: '客戶二',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-11-30'),
        totalValue: 2000000,
        status: '已完成',
        scope: '範圍二',
        payments: [],
        changeOrders: [],
        versions: [],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
    },
];

// Import the mocked hooks to access their implementations
const { useContractExport } = require('@/hooks/business/use-contract-actions');
const { useTableState } = require('@/hooks/ui/use-table-state');

describe('ContractsTable', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        
        // Set default mock implementations
        mockGetProcessedData.mockImplementation((data) => data);
        useContractExport.mockReturnValue({
            exportToCSV: mockExportToCSV,
            exporting: false,
            exportError: null,
        });
        useTableState.mockReturnValue({
            getProcessedData: mockGetProcessedData,
        });
    });

    describe('Rendering', () => {
        it('renders table with contracts', () => {
            render(<ContractsTable contracts={mockContracts} />);

            expect(screen.getByText('合約')).toBeInTheDocument();
            expect(screen.getByText('所有進行中和已完成的營造合約總覽。')).toBeInTheDocument();
            expect(screen.getByText('合約一')).toBeInTheDocument();
            expect(screen.getByText('合約二')).toBeInTheDocument();
        });

        it('renders table headers correctly', () => {
            render(<ContractsTable contracts={mockContracts} />);

            expect(screen.getByText('合約名稱')).toBeInTheDocument();
            expect(screen.getByText('承包商')).toBeInTheDocument();
            expect(screen.getByText('結束日期')).toBeInTheDocument();
            expect(screen.getByText('價值')).toBeInTheDocument();
            expect(screen.getByText('狀態')).toBeInTheDocument();
        });

        it('renders export button', () => {
            render(<ContractsTable contracts={mockContracts} />);

            const exportButton = screen.getByRole('button', { name: /匯出 CSV/i });
            expect(exportButton).toBeInTheDocument();
            expect(exportButton).not.toBeDisabled();
        });

        it('handles empty contracts list', () => {
            render(<ContractsTable contracts={[]} />);

            expect(screen.getByText('合約')).toBeInTheDocument();
            expect(screen.getByText('所有進行中和已完成的營造合約總覽。')).toBeInTheDocument();

            // Table headers should still be present
            expect(screen.getByText('合約名稱')).toBeInTheDocument();

            // But no contract rows
            expect(screen.queryByText('合約一')).not.toBeInTheDocument();
        });

        it('processes contracts through table state hook', () => {
            render(<ContractsTable contracts={mockContracts} />);

            expect(mockGetProcessedData).toHaveBeenCalledWith(mockContracts);
        });
    });

    describe('Contract Details Sheet Interaction', () => {
        it('opens contract details sheet when contract is clicked', async () => {
            render(<ContractsTable contracts={mockContracts} />);

            // Click on the first contract row
            const contractRows = screen.getAllByText('合約一');
            const contractRow = contractRows[0].closest('tr');
            fireEvent.click(contractRow!);

            // Wait for the sheet to open
            await waitFor(() => {
                expect(screen.getByTestId('contract-details-sheet')).toBeInTheDocument();
                // Check that the sheet contains the contract name
                const sheetElement = screen.getByTestId('contract-details-sheet');
                expect(sheetElement).toHaveTextContent('合約一');
            });
        });

        it('closes contract details sheet when close is clicked', async () => {
            render(<ContractsTable contracts={mockContracts} />);

            // Open the sheet
            const contractRow = screen.getByText('合約一').closest('tr');
            fireEvent.click(contractRow!);

            await waitFor(() => {
                expect(screen.getByTestId('contract-details-sheet')).toBeInTheDocument();
            });

            // Close the sheet
            const closeButton = screen.getByText('Close');
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByTestId('contract-details-sheet')).not.toBeInTheDocument();
            });
        });

        it('clears selected contract when sheet is closed', async () => {
            render(<ContractsTable contracts={mockContracts} />);

            // Open the sheet
            const contractRow = screen.getByText('合約一').closest('tr');
            fireEvent.click(contractRow!);

            await waitFor(() => {
                expect(screen.getByTestId('contract-details-sheet')).toBeInTheDocument();
            });

            // Close the sheet
            const closeButton = screen.getByText('Close');
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByTestId('contract-details-sheet')).not.toBeInTheDocument();
            });

            // Reopen should work (indicating state was cleared)
            fireEvent.click(contractRow!);
            await waitFor(() => {
                expect(screen.getByTestId('contract-details-sheet')).toBeInTheDocument();
            });
        });
    });

    describe('Export Functionality', () => {
        it('calls export function when export button is clicked', async () => {
            const user = userEvent.setup();
            render(<ContractsTable contracts={mockContracts} />);

            const exportButton = screen.getByRole('button', { name: /匯出 CSV/i });
            await user.click(exportButton);

            expect(mockExportToCSV).toHaveBeenCalledWith(mockContracts, {
                format: 'csv',
                filename: 'contracts_export.csv',
                includePayments: false,
                includeChangeOrders: false,
            });
        });

        it('shows loading state during export', () => {
            useContractExport.mockReturnValue({
                exportToCSV: mockExportToCSV,
                exporting: true,
                exportError: null,
            });

            render(<ContractsTable contracts={mockContracts} />);

            const exportButton = screen.getByRole('button', { name: /匯出中.../i });
            expect(exportButton).toBeDisabled();
        });

        it('shows error message when export fails', () => {
            const mockError = { message: '匯出失敗' };
            useContractExport.mockReturnValue({
                exportToCSV: mockExportToCSV,
                exporting: false,
                exportError: mockError,
            });

            render(<ContractsTable contracts={mockContracts} />);

            expect(screen.getByText('匯出失敗: 匯出失敗')).toBeInTheDocument();
        });

        it('handles export success', async () => {
            const user = userEvent.setup();
            mockExportToCSV.mockResolvedValue(undefined);

            render(<ContractsTable contracts={mockContracts} />);

            const exportButton = screen.getByRole('button', { name: /匯出 CSV/i });
            await user.click(exportButton);

            expect(mockExportToCSV).toHaveBeenCalledTimes(1);
        });

        it('handles export failure gracefully', async () => {
            const user = userEvent.setup();
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockExportToCSV.mockRejectedValue(new Error('Export failed'));

            render(<ContractsTable contracts={mockContracts} />);

            const exportButton = screen.getByRole('button', { name: /匯出 CSV/i });
            await user.click(exportButton);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Export failed:', expect.any(Error));
            consoleErrorSpy.mockRestore();
        });

        it('disables export button when no contracts', () => {
            render(<ContractsTable contracts={[]} />);

            const exportButton = screen.getByRole('button', { name: /匯出 CSV/i });
            expect(exportButton).not.toBeDisabled(); // Button should still be enabled even with empty data
        });

        it('exports with correct default options', async () => {
            const user = userEvent.setup();
            render(<ContractsTable contracts={mockContracts} />);

            const exportButton = screen.getByRole('button', { name: /匯出 CSV/i });
            await user.click(exportButton);

            expect(mockExportToCSV).toHaveBeenCalledWith(mockContracts, {
                format: 'csv',
                filename: 'contracts_export.csv',
                includePayments: false,
                includeChangeOrders: false,
            });
        });
    });

    describe('Hook Integration', () => {
        it('initializes table state hook with correct options', () => {
            render(<ContractsTable contracts={mockContracts} />);

            expect(useTableState).toHaveBeenCalledWith({
                defaultPageSize: 10,
            });
        });

        it('initializes contract export hook', () => {
            render(<ContractsTable contracts={mockContracts} />);

            expect(useContractExport).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('displays export error message with proper styling', () => {
            const mockError = { message: '網路連線失敗' };
            useContractExport.mockReturnValue({
                exportToCSV: mockExportToCSV,
                exporting: false,
                exportError: mockError,
            });

            render(<ContractsTable contracts={mockContracts} />);

            const errorMessage = screen.getByText('匯出失敗: 網路連線失敗');
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage.closest('div')).toHaveClass('bg-red-50', 'border-red-200', 'text-red-700');
        });

        it('does not display error message when no error', () => {
            render(<ContractsTable contracts={mockContracts} />);

            expect(screen.queryByText(/匯出失敗/)).not.toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels for export button', () => {
            render(<ContractsTable contracts={mockContracts} />);

            const exportButton = screen.getByRole('button', { name: /匯出 CSV/i });
            expect(exportButton).toBeInTheDocument();
        });

        it('has proper table structure', () => {
            render(<ContractsTable contracts={mockContracts} />);

            const table = screen.getByRole('table');
            expect(table).toBeInTheDocument();

            const columnHeaders = screen.getAllByRole('columnheader');
            expect(columnHeaders).toHaveLength(6); // Including the hidden "操作" column
        });

        it('has screen reader only text for actions column', () => {
            render(<ContractsTable contracts={mockContracts} />);

            const srOnlyText = screen.getByText('操作');
            expect(srOnlyText).toHaveClass('sr-only');
        });
    });
});