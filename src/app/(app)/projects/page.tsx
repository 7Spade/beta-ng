'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { useProjects } from '@/context/ProjectContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CreateProjectDialog } from '@/components/app/create-project-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Task } from '@/lib/types';

function calculateProgress(tasks: Task[]): { completedValue: number } {
  let completedValue = 0;

  function recurse(taskArray: Task[]) {
    taskArray.forEach(task => {
      // Only count leaf nodes for progress
      if (task.subTasks && task.subTasks.length > 0) {
        recurse(task.subTasks);
      } else {
        if (task.status === '已完成') {
          completedValue += task.value;
        }
      }
    });
  }

  recurse(tasks);
  return { completedValue };
}


export default function ProjectsPage() {
  const { projects, loading } = useProjects();

  return (
    <>
      <div className="flex items-center justify-end">
        <CreateProjectDialog />
      </div>
      
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full mt-2" />
                        <Skeleton className="h-4 w-1/2 mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                         <div className="space-y-2">
                             <Skeleton className="h-4 w-1/4" />
                             <Skeleton className="h-4 w-1/2" />
                         </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">尚無專案</h2>
            <p className="text-muted-foreground mt-2">點擊「新增專案」以開始。</p>
        </div>
      ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const { completedValue } = calculateProgress(project.tasks);
          const progressPercentage = project.value > 0 ? (completedValue / project.value) * 100 : 0;
          
          return (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                         <span className="text-sm font-medium text-muted-foreground">進度</span>
                         <span className="text-sm font-semibold">{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">價值 ${completedValue.toLocaleString()} / ${project.value.toLocaleString()} 已完成</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">開始日期：</span> {project.startDate ? format(project.startDate, 'yyyy-MM-dd') : '無'}</p>
                  <p><span className="font-medium text-foreground">結束日期：</span> {project.endDate ? format(project.endDate, 'yyyy-MM-dd') : '無'}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link href={`/projects/${project.id}`}>查看詳情</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      )}
    </>
  );
}
