# Contract Export Service Usage

This document explains how to use the new Contract Export Service to replace the existing export logic in components.

## Basic Usage

### Replace existing handleExport in contracts-table.tsx

**Before (in component):**
```typescript
const handleExport = () => {
  const headers = ['ID', '名稱', '承包商', '客戶', '開始日期', '結束日期', '總價值', '狀態'];
  const rows = contracts.map(c => [
    c.id,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.contractor.replace(/"/g, '""')}"`,
    `"${c.client.replace(/"/g, '""')}"`,
    c.startDate.toISOString().split('T')[0],
    c.endDate.toISOString().split('T')[0],
    c.totalValue,
    c.status,
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'contracts_export.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

**After (using service):**
```typescript
import { ContractExportService } from '@/services/contracts';

const handleExport = () => {
  ContractExportService.exportContractsToCSV(contracts);
};
```

## Advanced Usage Examples

### Export with custom filename and filters
```typescript
import { ContractExportService } from '@/services/contracts';

// Export only active contracts
const handleExportActive = () => {
  ContractExportService.exportContractsToCSV(contracts, {
    filename: 'active_contracts.csv',
    statusFilter: ['啟用中']
  });
};

// Export contracts within date range
const handleExportDateRange = () => {
  ContractExportService.exportContractsToCSV(contracts, {
    filename: 'contracts_2024.csv',
    dateRange: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    }
  });
};
```

### Export contracts with payment details
```typescript
const handleExportWithPayments = () => {
  ContractExportService.exportContractsWithPayments(contracts, {
    filename: 'contracts_payments_report.csv'
  });
};
```

### Export contracts with change orders
```typescript
const handleExportWithChangeOrders = () => {
  ContractExportService.exportContractsWithChangeOrders(contracts, {
    filename: 'contracts_change_orders_report.csv'
  });
};
```

### Export contract summary with statistics
```typescript
const handleExportSummary = () => {
  ContractExportService.exportContractSummary(contracts, {
    filename: 'contract_summary_report.csv'
  });
};
```

## Integration with Hooks

When using with custom hooks (future implementation):

```typescript
import { useContractActions } from '@/hooks/business/use-contract-actions';

function ContractsTable({ contracts }: ContractsTableProps) {
  const { exportToCSV } = useContractActions();

  const handleExport = () => {
    exportToCSV(contracts);
  };

  // ... rest of component
}
```

## Benefits of the New Service

1. **Separation of Concerns**: Export logic is moved out of UI components
2. **Reusability**: Can be used across different components
3. **Testability**: Business logic can be tested independently
4. **Flexibility**: Multiple export formats and filtering options
5. **Maintainability**: Centralized export logic is easier to maintain
6. **Type Safety**: Full TypeScript support with proper interfaces

## Migration Steps

1. Import the ContractExportService in your component
2. Replace the existing handleExport function with a call to the service
3. Remove the old export logic from the component
4. Test the new export functionality
5. Remove any unused imports related to the old export logic

## Error Handling

The export service handles common CSV formatting issues automatically:
- Escapes commas, quotes, and newlines in data
- Handles null/undefined values gracefully
- Formats dates consistently
- Provides proper CSV MIME type for downloads