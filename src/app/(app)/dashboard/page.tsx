/**
 * @project Beta-NG Integrated Platform - 統一整合平台儀表板頁面
 * @framework Next.js 15+ (App Router)
 * @typescript 5.0+
 * @author Beta-NG Development Team
 * @created 2025-01-22
 * @updated 2025-01-22
 * @version 1.0.0
 * 
 * @fileoverview Dashboard 模組主頁面 - 專案管理儀表板和統計概覽
 * @description 提供專案統計、任務完成度分析、即將到期的專案提醒，以及各專案的進度圖表展示。
 * 整合了專案管理數據，提供全面的分析視圖和關鍵績效指標 (KPI) 展示。
 */

'use client';

import { ProjectDashboard } from '@/components/app/dashboard/dashboard';
import { ContractDashboard } from '@/components/contracts/dashboard/dashboard';
import PartnerVersePage from '@/app/(app)/partnerverse/page';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">專案總覽</h2>
        <ProjectDashboard />
      </section>

      <Separator />

      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">合約總覽</h2>
        <ContractDashboard />
      </section>
      
      <Separator />

      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">合作夥伴總覽</h2>
        <PartnerVersePage />
      </section>
    </div>
  );
}
