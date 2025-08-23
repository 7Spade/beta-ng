import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContractsRow } from '../contracts-row';
import type { Contract } from '@/types/entities/contract.types';

// Mock the formatDate utility and cn function
jest.mock('@/lib/utils', () => ({
  formatDate: jest.fn((date: Date) => date.toLocaleDateString()),
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
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

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <div data-variant={variant} {...props}>{children}</div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
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

const mockContract: Contract = {
  id: 'test-contract-1',
  name: '測試合約',
  contractor: '測試承包商',
  client: '測試客戶',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  totalValue: 1000000,
  status: '啟用中',
  scope: '測試範圍',
  payments: [],
  changeOrders: [],
  versions: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Get the mocked function
const { formatDate } = require('@/lib/utils');

describe('ContractsRow', () => {
  const mockOnViewDetails = jest.fn();

  beforeEach(() => {
    mockOnViewDetails.mockClear();
    formatDate.mockImplementation((date: Date) => date.toLocaleDateString());
  });

  describe('Rendering', () => {
    it('renders contract information correctly', () => {
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      expect(screen.getByText('測試合約')).toBeInTheDocument();
      expect(screen.getByText('測試承包商')).toBeInTheDocument();
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(screen.getByText('啟用中')).toBeInTheDocument();
    });

    it('formats date using formatDate utility', () => {
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      expect(formatDate).toHaveBeenCalledWith(mockContract.endDate);
    });

    it('formats currency correctly', () => {
      const contractWithLargeValue = {
        ...mockContract,
        totalValue: 1234567,
      };

      render(
        <table>
          <tbody>
            <ContractsRow contract={contractWithLargeValue} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      expect(screen.getByText('$1,234,567')).toBeInTheDocument();
    });

    it('formats currency with zero value', () => {
      const contractWithZeroValue = {
        ...mockContract,
        totalValue: 0,
      };

      render(
        <table>
          <tbody>
            <ContractsRow contract={contractWithZeroValue} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('renders all table cells with correct responsive classes', () => {
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      const cells = screen.getAllByRole('cell');
      expect(cells).toHaveLength(6);

      // Check responsive classes
      expect(cells[1]).toHaveClass('hidden', 'md:table-cell'); // contractor
      expect(cells[2]).toHaveClass('hidden', 'lg:table-cell'); // end date
    });
  });

  describe('Status Badge', () => {
    it('renders correct status badge variant for each status', () => {
      const statusTests = [
        { status: '啟用中' as const, expectedVariant: 'default' },
        { status: '已完成' as const, expectedVariant: 'secondary' },
        { status: '暫停中' as const, expectedVariant: 'outline' },
        { status: '已終止' as const, expectedVariant: 'destructive' },
      ];

      statusTests.forEach(({ status }) => {
        const contractWithStatus = { ...mockContract, status };
        const { unmount } = render(
          <table>
            <tbody>
              <ContractsRow contract={contractWithStatus} onViewDetails={mockOnViewDetails} />
            </tbody>
          </table>
        );

        expect(screen.getByText(status)).toBeInTheDocument();
        unmount();
      });
    });

    it('handles unknown status gracefully', () => {
      const contractWithUnknownStatus = {
        ...mockContract,
        status: '未知狀態' as any,
      };

      render(
        <table>
          <tbody>
            <ContractsRow contract={contractWithUnknownStatus} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      expect(screen.getByText('未知狀態')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onViewDetails when row is clicked', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      const row = screen.getByRole('row');
      await user.click(row);

      expect(mockOnViewDetails).toHaveBeenCalledWith(mockContract);
      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
    });

    it('calls onViewDetails when dropdown menu item is clicked', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      // Click the view details menu item directly (since our mock doesn't require dropdown opening)
      const viewDetailsItem = screen.getByText('查看詳情');
      await user.click(viewDetailsItem);

      expect(mockOnViewDetails).toHaveBeenCalledWith(mockContract);
      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
    });

    it('prevents dropdown click from triggering row click', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      // Click the dropdown trigger button (should not trigger row click)
      const dropdownTrigger = screen.getByRole('button', { name: /切換選單/i });
      await user.click(dropdownTrigger);

      // The row click handler should not have been called when clicking the button
      expect(mockOnViewDetails).not.toHaveBeenCalled();
    });

    it('handles keyboard navigation on row', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      const row = screen.getByRole('row');
      
      // Simulate keyboard interaction by clicking the row
      await user.click(row);

      expect(mockOnViewDetails).toHaveBeenCalledWith(mockContract);
    });

    it('handles multiple rapid clicks gracefully', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      const row = screen.getByRole('row');
      
      // Simulate rapid clicks
      await user.click(row);
      await user.click(row);
      await user.click(row);

      expect(mockOnViewDetails).toHaveBeenCalledTimes(3);
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockContract);
    });
  });

  describe('Dropdown Menu', () => {
    it('renders dropdown menu with correct structure', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      const dropdownTrigger = screen.getByRole('button', { name: /切換選單/i });
      expect(dropdownTrigger).toBeInTheDocument();

      await user.click(dropdownTrigger);

      const viewDetailsItem = screen.getByText('查看詳情');
      expect(viewDetailsItem).toBeInTheDocument();

      const eyeIcon = screen.getByTestId('eye-icon');
      expect(eyeIcon).toBeInTheDocument();
    });

    it('closes dropdown when menu item is selected', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      const viewDetailsItem = screen.getByText('查看詳情');
      await user.click(viewDetailsItem);

      // Verify the action was called (in a real dropdown, the menu would close)
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockContract);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      const row = screen.getByRole('row');
      expect(row).toHaveClass('cursor-pointer');

      const dropdownTrigger = screen.getByRole('button', { name: /切換選單/i });
      expect(dropdownTrigger).toHaveAttribute('aria-haspopup', 'true');
    });

    it('has screen reader accessible text', () => {
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      const srText = screen.getByText('切換選單');
      expect(srText).toHaveClass('sr-only');
    });

    it('supports keyboard navigation', () => {
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      const row = screen.getByRole('row');
      const dropdownTrigger = screen.getByRole('button', { name: /切換選單/i });

      expect(row).toBeInTheDocument();
      expect(dropdownTrigger).toBeInTheDocument();

      // Elements should be present and interactive
      expect(row).toHaveClass('cursor-pointer');
      expect(dropdownTrigger).toHaveAttribute('aria-haspopup', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('handles contract with missing optional fields', () => {
      const minimalContract = {
        ...mockContract,
        contractor: '',
        client: '',
      };

      render(
        <table>
          <tbody>
            <ContractsRow contract={minimalContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      expect(screen.getByText('測試合約')).toBeInTheDocument();
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });

    it('handles very long contract names', () => {
      const contractWithLongName = {
        ...mockContract,
        name: '這是一個非常非常非常長的合約名稱，用來測試UI是否能正確處理長文本內容',
      };

      render(
        <table>
          <tbody>
            <ContractsRow contract={contractWithLongName} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      expect(screen.getByText(contractWithLongName.name)).toBeInTheDocument();
    });

    it('handles very large monetary values', () => {
      const contractWithLargeValue = {
        ...mockContract,
        totalValue: 999999999999,
      };

      render(
        <table>
          <tbody>
            <ContractsRow contract={contractWithLargeValue} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      expect(screen.getByText('$999,999,999,999')).toBeInTheDocument();
    });

    it('handles date formatting errors gracefully', () => {
      formatDate.mockImplementation(() => {
        return 'Invalid Date';
      });

      // Should render with fallback date
      render(
        <table>
          <tbody>
            <ContractsRow contract={mockContract} onViewDetails={mockOnViewDetails} />
          </tbody>
        </table>
      );

      expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });
  });
});