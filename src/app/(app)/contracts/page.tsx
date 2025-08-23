
'use client';

import { useState } from 'react';
import { useContractContext } from '@/context/contracts';
import { ContractsTable } from '@/components/features/contracts/table';
import { AiSummarizerDialog } from '@/components/features/contracts/ai-summarizer-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ContractDashboard } from '@/components/features/contracts/dashboard/dashboard';
import { CreateContractDialog } from '@/components/features/contracts/create-contract-dialog';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { Contract } from '@/types/entities/contract.types';
import type { CreateContractDto } from '@/types/dto/contract.dto';

export default function ContractsPage() {
  const { 
    contracts, 
    loading, 
    error, 
    userMessage, 
    createContract, 
    refreshContracts, 
    clearError 
  } = useContractContext();
  
  const { toast } = useToast();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const handleAddContract = async (data: Omit<Contract, 'id' | 'payments' | 'changeOrders' | 'versions' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Transform the data to CreateContractDto format
      const createData: CreateContractDto = {
        name: data.name,
        contractor: data.contractor,
        client: data.client,
        clientRepresentative: data.clientRepresentative,
        startDate: data.startDate,
        endDate: data.endDate,
        totalValue: data.totalValue,
        scope: data.scope,
        customId: data.customId,
        status: data.status,
      };

      await createContract(createData);
      
      toast({
        title: "合約已建立",
        description: `合約 "${data.name}" 已成功新增。`,
      });
      setCreateDialogOpen(false);
      return true;

    } catch (error) {
      console.error("新增合約時發生錯誤：", error);
      toast({
        title: "錯誤",
        description: "新增合約失敗，請再試一次。",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <AiSummarizerDialog />
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          新增合約
        </Button>
        <CreateContractDialog 
          isOpen={isCreateDialogOpen} 
          onOpenChange={setCreateDialogOpen} 
          onSave={handleAddContract} 
        />
      </div>
      
      <ContractDashboard />
      
      {error && userMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{userMessage}</span>
            <div className="flex gap-2">
              <button
                onClick={clearError}
                className="text-sm underline hover:no-underline"
              >
                關閉
              </button>
              <button
                onClick={refreshContracts}
                className="text-sm underline hover:no-underline flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                重試
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-2/4 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <ContractsTable contracts={contracts} />
      )}
    </div>
  );
}
