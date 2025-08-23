
'use client';

import type { FC } from 'react';
import type { Partner } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

interface TransactionsTabProps {
    partner: Partner;
}

export const TransactionsTab: FC<TransactionsTabProps> = ({ partner }) => {
    
    const transactionStatusColor = (status: '已完成' | '待處理' | '失敗') => {
        switch (status) {
            case '已完成': return 'text-green-600';
            case '待處理': return 'text-yellow-600';
            case '失敗': return 'text-red-600';
        }
    }

    return (
        <Card>
            <CardHeader>
              <CardTitle>交易歷史</CardTitle>
              <CardDescription>與 {partner.name} 相關的財務記錄。</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>日期</TableHead>
                            <TableHead>描述</TableHead>
                            <TableHead>狀態</TableHead>
                            <TableHead className="text-right">金額</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {partner.transactions && partner.transactions.length > 0 ? partner.transactions.map(tx => (
                            <TableRow key={tx.id}>
                                <TableCell>{formatDate(tx.date)}</TableCell>
                                <TableCell className="font-medium">{tx.description}</TableCell>
                                <TableCell className={transactionStatusColor(tx.status)}>{tx.status}</TableCell>
                                <TableCell className="text-right">${tx.amount.toLocaleString()}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">找不到交易紀錄。</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
