'use client';

import * as React from 'react';
import type { Contract } from '@/types/entities/contract.types';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ContractsRowProps {
  contract: Contract;
  onViewDetails: (contract: Contract) => void;
}

export function ContractsRow({ contract, onViewDetails }: ContractsRowProps) {
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
  };

  const handleRowClick = () => {
    onViewDetails(contract);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleViewDetailsClick = () => {
    onViewDetails(contract);
  };

  return (
    <TableRow className="cursor-pointer" onClick={handleRowClick}>
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
          <DropdownMenuContent align="end" onClick={handleDropdownClick}>
            <DropdownMenuItem onSelect={handleViewDetailsClick}>
              <Eye className="mr-2 h-4 w-4" />
              查看詳情
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}