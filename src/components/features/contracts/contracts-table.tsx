'use client';

import * as React from 'react';
import type { Contract } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, MoreHorizontal, Eye } from 'lucide-react';
import { ContractDetailsSheet } from './contracts-details-sheet';
import { formatDate } from '@/lib/utils';

interface ContractsTableProps {
  contracts: Contract[];
}

export function ContractsTable({ contracts: initialContracts }: ContractsTableProps) {
  const [contracts] = React.useState<Contract[]>(initialContracts);
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);
  const [isSheetOpen, setSheetOpen] = React.useState(false);

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setSheetOpen(true);
  };
  
  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      setSelectedContract(null);
    }
  }

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

  const getStatusVariant = (status: Contract['status']): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
      case '啟用中':
        return 'default';
      case '已完成':
        return 'secondary';
      case '暫停中':
        return 'outline';
      case '已終止':
        return 'destructive';
      default:
        return 'default';
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>合約</CardTitle>
            <CardDescription>所有進行中和已完成的營造合約總覽。</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            匯出 CSV
          </Button>
        </CardHeader>
        <CardContent>
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
              {contracts.map((contract) => (
                <TableRow key={contract.id} className="cursor-pointer" onClick={() => handleViewDetails(contract)}>
                  <TableCell className="font-medium">{contract.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{contract.contractor}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(contract.endDate)}
                  </TableCell>
                  <TableCell>
                    ${contract.totalValue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(contract.status)}>{contract.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">切換選單</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onSelect={() => handleViewDetails(contract)}>
                          <Eye className="mr-2 h-4 w-4" />
                          查看詳情
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
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
