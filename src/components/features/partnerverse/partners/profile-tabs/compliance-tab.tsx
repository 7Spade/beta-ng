
'use client';

import type { FC } from 'react';
import type { Partner } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ShieldCheck, FileWarning, FileX } from 'lucide-react';

const ComplianceStatusIcon: FC<{ status: '有效' | '即將到期' | '已過期' }> = ({ status }) => {
    switch (status) {
        case '有效': return <ShieldCheck className="h-5 w-5 text-green-600" />;
        case '即將到期': return <FileWarning className="h-5 w-5 text-yellow-600" />;
        case '已過期': return <FileX className="h-5 w-5 text-red-600" />;
    }
}

interface ComplianceTabProps {
    partner: Partner;
}

export const ComplianceTab: FC<ComplianceTabProps> = ({ partner }) => {
    return (
        <Card>
            <CardHeader>
              <CardTitle>合規文件</CardTitle>
              <CardDescription>追蹤 {partner.name} 所需的許可證和證書。</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>文件</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>到期日</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partner.complianceDocuments && partner.complianceDocuments.length > 0 ? partner.complianceDocuments.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell className="flex items-center gap-2">
                          <ComplianceStatusIcon status={doc.status} /> {doc.status}
                      </TableCell>
                      <TableCell>{new Date(doc.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                          <Button variant="link" size="sm" asChild><a href={doc.fileUrl} target="_blank">檢視</a></Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">找不到合規文件。</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
    );
};
