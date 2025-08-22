/**
 * @project Beta-NG Integrated Platform - 統一整合平台分析模組
 * @framework Next.js 15+ (App Router)
 * @typescript 5.0+
 * @author Beta-NG Development Team
 * @created 2025-01-22
 * @updated 2025-01-22
 * @version 1.0.0
 * 
 * @fileoverview Analytics 模組主頁面 - 專案數據分析和效能儀表板
 * @description 提供專案統計、任務完成度分析、即將到期的專案提醒，以及各專案的進度圖表展示。
 * 整合了專案管理數據，提供全面的分析視圖和關鍵績效指標 (KPI) 展示。
 */

import { AnalyticsDashboard } from '@/components/analytics/dashboard/dashboard';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <AnalyticsDashboard />
    </div>
  );
}
