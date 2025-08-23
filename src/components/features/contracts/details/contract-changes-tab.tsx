
'use client';

import type { Contract, ChangeOrder } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ContractChangesTabProps {
  contract: Contract;
}

const getStatusVariant = (status: ChangeOrder['status']): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
        case '已核准': return 'default';
        case '待處理': return 'outline';
        case '已拒絕': return 'destructive';
        default: return 'secondary';
    }
}

export function ContractChangesTab({ contract }: ContractChangesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>變更單</CardTitle>
        <CardDescription>合約修改與修訂的管理。</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>標題</TableHead>
              <TableHead>日期</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>成本影響</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contract.changeOrders && contract.changeOrders.length > 0 ? (
                contract.changeOrders.map((order) => (
                    <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.title}</TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell><Badge variant={getStatusVariant(order.status)}>{order.status}</Badge></TableCell>
                    <TableCell>${order.impact.cost.toLocaleString()}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">沒有變更單記錄。</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
