'use client';

import * as React from 'react';
import type { Contract } from '@/types/entities/contract.types';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ContractDetailsSheet } from '../contracts-details-sheet';
import { useContractExport } from '@/hooks/business/use-contract-actions';
import { useTableState } from '@/hooks/ui/use-table-state';
import { ContractsRow } from './contracts-row';

interface ContractsTableProps {
  contracts: Contract[];
}

export function ContractsTable({ contracts: initialContracts }: ContractsTableProps) {
  // UI state management using hooks
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);
  const [isSheetOpen, setSheetOpen] = React.useState(false);
  
  // Table state management
  const tableState = useTableState<Contract>({
    defaultPageSize: 10,
  });
  
  // Export functionality using business logic hook
  const { exportToCSV, exporting, exportError } = useContractExport();

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setSheetOpen(true);
  };
  
  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      setSelectedContract(null);
    }
  };

  const handleExport = async () => {
    try {
      await exportToCSV(initialContracts, {
        format: 'csv',
        filename: 'contracts_export.csv',
        includePayments: false,
        includeChangeOrders: false,
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Process contracts through table state management
  const processedContracts = tableState.getProcessedData(initialContracts);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>合約</CardTitle>
            <CardDescription>所有進行中和已完成的營造合約總覽。</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? '匯出中...' : '匯出 CSV'}
          </Button>
        </CardHeader>
        <CardContent>
          {exportError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              匯出失敗: {exportError.message}
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>合約名稱</TableHead>
                <TableHead className="hidden md:table-cell">承包商</TableHead>
                <TableHead className="hidden lg:table-cell">結束日期</TableHead>
                <TableHead>價值</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead><span className="sr-only">操作</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedContracts.map((contract) => (
                <ContractsRow
                  key={contract.id}
                  contract={contract}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedContract && (
         <ContractDetailsSheet contract={selectedContract} isOpen={isSheetOpen} onOpenChange={handleSheetOpenChange} />
      )}
    </>
  );
}