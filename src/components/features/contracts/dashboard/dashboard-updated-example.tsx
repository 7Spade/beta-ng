/**
 * @project Beta-NG Integrated Platform - 統一整合平台合約儀表板
 * @framework Next.js 15+ (App Router)
 * @typescript 5.0+
 * @author Beta-NG Development Team
 * @created 2025-01-22
 * @updated 2025-01-22
 * @version 2.0.0
 * 
 * @fileoverview 重構後的合約儀表板元件 - 使用新的統計服務
 * @description 顯示合約相關統計數據，使用分離的業務邏輯層。
 */
'use client';

import { useState, useEffect } from 'react';
import { DashboardStats } from '../dashboard-stats';
import { Skeleton } from '@/components/ui/skeleton';
import { contractService } from '@/services/contracts';
import type { DashboardStats as DashboardStatsType } from '@/types/services/contract.service.types';

export function ContractDashboardUpdated() {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the new contract service to get dashboard stats
        const dashboardStats = await contractService.getContractDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("獲取儀表板統計數據時發生錯誤：", error);
        setError(error instanceof Error ? error.message : '未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-4 p-4 text-center text-red-500">
          錯誤：{error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-4 p-4 text-center text-gray-500">
          無法載入統計數據
        </div>
      </div>
    );
  }

  // Adapt the new stats format to the existing component interface
  const adaptedStats = {
    totalContracts: stats.totalContracts,
    active: stats.activeContracts,
    completed: stats.completedContracts,
    totalValue: stats.totalValue,
  };

  return <DashboardStats stats={adaptedStats} />;
}

/**
 * 使用說明：
 * 
 * 這個更新後的元件展示了如何使用新的統計服務：
 * 
 * 1. 移除了直接的 Firebase 操作
 * 2. 使用 contractService.getContractDashboardStats() 獲取統計數據
 * 3. 包含了適當的錯誤處理
 * 4. 保持了與現有 DashboardStats 元件的相容性
 * 
 * 主要改進：
 * - 關注點分離：UI 元件只負責渲染，業務邏輯在服務層
 * - 更好的錯誤處理：統一的錯誤處理機制
 * - 可測試性：可以輕鬆模擬服務層進行測試
 * - 可重用性：統計邏輯可以在其他地方重用
 */