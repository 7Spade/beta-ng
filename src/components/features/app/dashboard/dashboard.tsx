/**
 * @project Beta-NG Integrated Platform - 統一整合平台專案儀表板
 * @framework Next.js 15+ (App Router)
 * @typescript 5.0+
 * @author Beta-NG Development Team
 * @created 2025-01-22
 * @updated 2025-01-22
 * @version 1.0.0
 * 
 * @fileoverview 專案儀表板元件
 * @description 顯示專案統計、任務完成度分析、即將到期的專案提醒，以及各專案的進度圖表。
 */
'use client';

import { useProjects } from '@/context/ProjectContext';
import { ProjectProgressChart } from '@/components/features/app/project-progress-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { differenceInDays, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectDashboard() {
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
    );
  }

  const totalTasks = projects.reduce((acc, p) => acc + countAllTasks(p.tasks), 0);
  const completedTasks = projects.reduce((acc, p) => acc + countAllTasks(p.tasks, '已完成'), 0);

  function countAllTasks(tasks: any[], status?: string): number {
    return tasks.reduce((acc, task) => {
      const statusMatch = status ? task.status === status : true;
      return acc + (statusMatch ? 1 : 0) + countAllTasks(task.subTasks, status);
    }, 0);
  }

  const upcomingDeadlines = projects.filter(p => p.endDate && differenceInDays(p.endDate, new Date()) <= 30 && differenceInDays(p.endDate, new Date()) > 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總專案數</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">目前進行中</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總任務數</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">{completedTasks} 已完成</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">即將到期的專案</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <ul className="space-y-1">
                {upcomingDeadlines.map(p => (
                  <li key={p.id} className="text-xs flex justify-between">
                    <span>{p.title}</span>
                    <span className="font-medium">{p.endDate ? format(p.endDate, 'yyyy-MM-dd') : ''}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">未來 30 天內沒有專案到期。</p>}
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
