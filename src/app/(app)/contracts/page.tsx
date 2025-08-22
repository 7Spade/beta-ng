'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Contract, ContractStatus } from '@/types';
import { DashboardStats } from '@/components/contract/dashboard-stats';
import { ContractsTable } from '@/components/contract/contracts-table';
import { AiSummarizerDialog } from '@/components/contract/ai-summarizer-dialog';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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


export default function Home() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const contractsCollection = collection(db, 'contracts');
        const contractSnapshot = await getDocs(contractsCollection);
        const contractList = contractSnapshot.docs.map(processFirestoreContract);
        setContracts(contractList);
      } catch (error) {
        console.error("Error fetching contracts: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const stats = {
    totalContracts: contracts.length,
    active: contracts.filter(c => c.status === 'Active').length,
    completed: contracts.filter(c => c.status === 'Completed').length,
    totalValue: contracts.reduce((acc, c) => acc + c.totalValue, 0),
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
        <Logo />
        <div className="ml-auto flex items-center gap-2">
          <AiSummarizerDialog />
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Contract
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
        <DashboardStats stats={stats} />
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
      </main>
    </div>
  );
}
