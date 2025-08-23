
'use client';

import type { Contract } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { ScrollArea } from '@/components/ui/scroll-area';
import { ContractDetailsTab } from './details/contract-details-tab';
import { ContractPaymentsTab } from './details/contract-payments-tab';
import { ContractChangesTab } from './details/contract-changes-tab';
import { ContractHistoryTab } from './details/contract-history-tab';

interface ContractDetailsSheetProps {
  contract: Contract;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ContractDetailsSheet({ contract, isOpen, onOpenChange }: ContractDetailsSheetProps) {

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-2xl">
        <ScrollArea className="h-full pr-6">
          <SheetHeader className="mb-4">
            <SheetTitle>{contract.name}</SheetTitle>
            <SheetDescription>
              {contract.customId || contract.id} - {contract.client}
            </SheetDescription>
          </SheetHeader>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">詳細資料</TabsTrigger>
              <TabsTrigger value="payments">付款</TabsTrigger>
              <TabsTrigger value="changes">變更單</TabsTrigger>
              <TabsTrigger value="history">歷史紀錄</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <ContractDetailsTab contract={contract} />
            </TabsContent>
            <TabsContent value="payments" className="mt-4">
              <ContractPaymentsTab contract={contract} />
            </TabsContent>
            <TabsContent value="changes" className="mt-4">
              <ContractChangesTab contract={contract} />
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <ContractHistoryTab contract={contract} />
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
