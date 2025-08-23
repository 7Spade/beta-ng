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
 * 重構後的純 UI 元件，使用 ContractContext 進行資料獲取和狀態管理。
 */
'use client';

import React, { useEffect } from 'react';
import { useContractContext } from '@/context/contracts';
import { DashboardStats } from '../dashboard-stats';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function ContractDashboard() {
  const { 
    dashboardStats, 
    loading, 
    error, 
    userMessage, 
    loadDashboardStats, 
    clearError 
  } = useContractContext();

  // Load dashboard stats on mount
  useEffect(() => {
    if (!dashboardStats) {
      loadDashboardStats();
    }
  }, [dashboardStats, loadDashboardStats]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  if (error && userMessage) {
    return (
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
              onClick={loadDashboardStats}
              className="text-sm underline hover:no-underline"
            >
              重試
            </button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="text-center text-muted-foreground">
          無法載入儀表板統計資料
        </div>
      </div>
    );
  }

  // Transform DashboardStats to match the DashboardStats component interface with memoization
  const transformedStats = React.useMemo(() => ({
    totalContracts: dashboardStats.totalContracts,
    active: dashboardStats.activeContracts,
    completed: dashboardStats.completedContracts,
    totalValue: dashboardStats.totalValue,
  }), [dashboardStats]);

  return <DashboardStats stats={transformedStats} />;
}
