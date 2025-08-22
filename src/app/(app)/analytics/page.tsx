/**
 * @project NG-Beta Integrated Platform - 統一整合平台分析模組
 * @framework Next.js 15+ (App Router)
 * @typescript 5.0+
 * @author NG-Beta Development Team
 * @created 2025-01-22
 * @updated 2025-01-22
 * @version 1.0.0
 * 
 * @fileoverview Analytics 模組主頁面 - 專案數據分析和效能儀表板
 * @description 提供專案統計、任務完成度分析、即將到期的專案提醒，以及各專案的進度圖表展示。
 * 整合了專案管理數據，提供全面的分析視圖和關鍵績效指標 (KPI) 展示。
 * 
 * @tech-stack
 * - Runtime: Node.js 20+
 * - Framework: Next.js 15 (App Router)
 * - Language: TypeScript 5.0+
 * - UI: shadcn/ui + Tailwind CSS 4.0+
 * - Icons: Lucide React
 * - State: React Context + Zustand
 * - Date: date-fns
 * - Charts: Recharts (via ProjectProgressChart)
 * 
 * @environment
 * - Node: >=20.0.0
 * - Package Manager: pnpm
 * - Build Tool: Turbopack
 * 
 * @features
 * - 專案總數統計和活躍狀態顯示
 * - 任務完成度分析和進度追蹤
 * - 即將到期專案的智慧提醒系統
 * - 各專案的視覺化進度圖表
 * - 響應式設計和載入狀態處理
 * 
 * @usage
 * 此頁面作為 Analytics 模組的主要入口，透過平行路由 @analytics 槽位渲染，
 * 提供專案數據的全面分析視圖，支援專案經理和團隊成員進行數據驅動的決策。
 */

'use client';

import { useProjects } from '@/context/ProjectContext';
import { ProjectProgressChart } from '@/components/app/project-progress-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { differenceInDays, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsPage() {
  const { projects, loading } = useProjects();

  if (loading) {
    return (
      <div className="space-y-8">
        <header>
          <Skeleton className="h-9 w-1/3" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28 md:col-span-2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  const totalTasks = projects.reduce((acc, p) => acc + countAllTasks(p.tasks), 0);
  const completedTasks = projects.reduce((acc, p) => acc + countAllTasks(p.tasks, 'Completed'), 0);

  function countAllTasks(tasks: any[], status?: string): number {
    return tasks.reduce((acc, task) => {
      const statusMatch = status ? task.status === status : true;
      return acc + (statusMatch ? 1 : 0) + countAllTasks(task.subTasks, status);
    }, 0);
  }

  const upcomingDeadlines = projects.filter(p => p.endDate && differenceInDays(p.endDate, new Date()) <= 30 && differenceInDays(p.endDate, new Date()) > 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          A glance at your active projects' performance.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">{completedTasks} completed</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <ul className="space-y-1">
                {upcomingDeadlines.map(p => (
                  <li key={p.id} className="text-xs flex justify-between">
                    <span>{p.title}</span>
                    <span className="font-medium">{p.endDate ? format(p.endDate, 'MMM dd, yyyy') : ''}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">No projects ending in the next 30 days.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectProgressChart key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
