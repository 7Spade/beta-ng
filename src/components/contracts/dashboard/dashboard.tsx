/**
 * @project Beta-NG Integrated Platform - 統一整合平台合約儀表板
 * @framework Next.js 15+ (App Router)
 * @typescript 5.0+
 * @author Beta-NG Development Team
 * @created 2025-01-22
 * @updated 2025-01-22
 * @version 1.0.0
 * 
 * @fileoverview 合約儀表板元件
 * @description 顯示合約相關統計數據，包括總數、進行中、已完成以及總價值。
 */
'use client';

import { useState, useEffect } from 'react';
import type { Contract } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DashboardStats } from '../dashboard-stats';
import { Skeleton } from '@/components/ui/skeleton';

export function ContractDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const contractsCollection = collection(db, 'contracts');
        const contractSnapshot = await getDocs(contractsCollection);
        const contractList = contractSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                startDate: data.startDate?.toDate(),
                endDate: data.endDate?.toDate(),
            } as Contract;
        });
        setContracts(contractList);
      } catch (error) {
        console.error("為儀表板獲取合約時發生錯誤：", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  if (loading) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
    )
  }

  const stats = {
    totalContracts: contracts.length,
    active: contracts.filter(c => c.status === '啟用中').length,
    completed: contracts.filter(c => c.status === '已完成').length,
    totalValue: contracts.reduce((acc, c) => acc + c.totalValue, 0),
  };

  return <DashboardStats stats={stats} />;
}
