
'use client';

import type { Contract } from '@/types/entities/contract.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface ContractHistoryTabProps {
  contract: Contract;
}

export function ContractHistoryTab({ contract }: ContractHistoryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>版本歷史</CardTitle>
        <CardDescription>合約版本的時間順序記錄。</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contract.versions && contract.versions.length > 0 ? (
            contract.versions.map((version, index) => (
                <div key={version.version} className="grid grid-cols-[auto_1fr] items-start gap-4">
                <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {version.version}
                    </div>
                    {index < contract.versions.length - 1 && <div className="h-10 w-px bg-border" />}
                </div>
                <div>
                    <p className="font-semibold">{formatDate(version.date)}</p>
                    <p className="text-sm text-muted-foreground">{version.changeSummary}</p>
                </div>
                </div>
            ))
          ) : (
             <div className="text-center text-muted-foreground py-8">沒有版本歷史記錄。</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
