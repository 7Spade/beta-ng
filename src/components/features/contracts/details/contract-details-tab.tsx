
'use client';

import type { Contract } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ContractDetailsTabProps {
  contract: Contract;
}

export function ContractDetailsTab({ contract }: ContractDetailsTabProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">承包商</h3>
            <p className="font-semibold">{contract.contractor}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">客戶</h3>
            <p className="font-semibold">{contract.client}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">開始日期</h3>
            <p className="font-semibold">{formatDate(contract.startDate)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">結束日期</h3>
            <p className="font-semibold">{formatDate(contract.endDate)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">總價值</h3>
            <p className="font-semibold">${contract.totalValue.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">狀態</h3>
            <Badge>{contract.status}</Badge>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">工作範疇</h3>
          <p className="text-sm mt-1">{contract.scope}</p>
        </div>
      </CardContent>
    </Card>
  );
}
