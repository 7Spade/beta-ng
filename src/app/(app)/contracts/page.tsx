
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, Timestamp, query } from 'firebase/firestore';
import type { Contract } from '@/lib/types';
import { ContractsTable } from '@/components/contracts/contracts-table';
import { AiSummarizerDialog } from '@/components/contracts/ai-summarizer-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ContractDashboard } from '@/components/contracts/dashboard/dashboard';
import { CreateContractDialog } from '@/components/contracts/create-contract-dialog';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';


// Helper function to convert Firestore Timestamps to Dates
const processFirestoreContract = (doc: any): Contract => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    startDate: data.startDate?.toDate(),
    endDate: data.endDate?.toDate(),
    payments: data.payments?.map((p: any) => ({
      ...p,
      requestDate: p.requestDate?.toDate(),
      paidDate: p.paidDate?.toDate(),
    })),
    changeOrders: data.changeOrders?.map((co: any) => ({
      ...co,
      date: co.date?.toDate(),
    })),
    versions: data.versions?.map((v: any) => ({
      ...v,
      date: v.date?.toDate(),
    })),
  } as Contract;
};


export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    const contractsCollection = collection(db, 'contracts');
    const q = query(contractsCollection);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const contractList = querySnapshot.docs.map(processFirestoreContract);
        setContracts(contractList);
        setLoading(false);
    }, (error) => {
        console.error("獲取合約時發生錯誤：", error);
        setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleAddContract = async (data: Omit<Contract, 'id' | 'payments' | 'changeOrders' | 'versions'>) => {
    try {
        const newContractData = {
            ...data,
            startDate: Timestamp.fromDate(data.startDate),
            endDate: Timestamp.fromDate(data.endDate),
            payments: [],
            changeOrders: [],
            versions: [{
                version: 1,
                date: Timestamp.now(),
                changeSummary: "初始版本"
            }]
        };

        await addDoc(collection(db, 'contracts'), newContractData);
        
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
