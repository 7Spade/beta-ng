
'use client';

import type { Contract, Payment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';

interface ContractPaymentsTabProps {
  contract: Contract;
}

const getStatusVariant = (status: Payment['status']): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
        case '已付款': return 'default';
        case '待處理': return 'outline';
        case '已逾期': return 'destructive';
        default: return 'secondary';
    }
}

export function ContractPaymentsTab({ contract }: ContractPaymentsTabProps) {
  const totalPaid = contract.payments
    .filter((p) => p.status === '已付款')
    .reduce((acc, p) => acc + p.amount, 0);
  const paymentProgress = (totalPaid / contract.totalValue) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>付款追蹤</CardTitle>
        <CardDescription>所有付款請求及其狀態的紀錄。</CardDescription>
        <div className="pt-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">總付款金額: ${totalPaid.toLocaleString()}</span>
            <span className="text-sm font-medium">${contract.totalValue.toLocaleString()}</span>
          </div>
          <Progress value={paymentProgress} aria-label={`${paymentProgress.toFixed(0)}% 已付款`} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>金額</TableHead>
              <TableHead>請求日期</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>付款日期</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contract.payments && contract.payments.length > 0 ? (
                contract.payments.map((payment) => (
                    <TableRow key={payment.id}>
                    <TableCell>${payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{formatDate(payment.requestDate)}</TableCell>
                    <TableCell><Badge variant={getStatusVariant(payment.status)}>{payment.status}</Badge></TableCell>
                    <TableCell>{payment.paidDate ? formatDate(payment.paidDate) : '未付款'}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">沒有付款記錄。</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
