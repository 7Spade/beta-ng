
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Project, Task } from '@/lib/types';

const COLORS = {
  '已完成': 'hsl(var(--chart-1))',
  '進行中': 'hsl(var(--chart-2))',
  '待處理': 'hsl(var(--secondary))',
};

type ProgressData = {
    completed: number;
    inProgress: number;
    pending: number;
    totalValue: number;
}

interface ProjectProgressChartProps {
  project: Project;
}

const calculateValueProgress = (project: Project): ProgressData => {
  const progress = { completed: 0, inProgress: 0, pending: 0 };
  
  const flattenTasks = (tasks: Task[]): Task[] => {
    let allTasks: Task[] = [];
    tasks.forEach(task => {
        allTasks.push(task);
        if (task.subTasks && task.subTasks.length > 0) {
            allTasks = allTasks.concat(flattenTasks(task.subTasks));
        }
    });
    return allTasks;
  }

  const allTasks = flattenTasks(project.tasks);

  allTasks.forEach(task => {
      // We only count leaf nodes for progress calculation to avoid double counting value.
      if (!task.subTasks || task.subTasks.length === 0) {
          if (task.status === '已完成') progress.completed += task.value;
          else if (task.status === '進行中') progress.inProgress += task.value;
          else progress.pending += task.value;
      }
  });


  return { ...progress, totalValue: project.value };
};

export function ProjectProgressChart({ project }: ProjectProgressChartProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const { completed, inProgress, pending, totalValue } = React.useMemo(
    () => calculateValueProgress(project),
    [project]
  );
  
  const completionPercentage = totalValue > 0 ? Math.round((completed / totalValue) * 100) : 0;

  const data = [
    { name: '已完成', value: completed },
    { name: '進行中', value: inProgress },
    { name: '待處理', value: pending },
  ].filter(item => item.value > 0);
  
  const totalTasks = project.tasks.reduce((acc, task) => acc + 1 + task.subTasks.length, 0);


  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>{totalTasks} 個任務，總價值：${project.value.toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="relative h-48 w-48">
          {isClient && (
            <PieChart width={192} height={192}>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                cornerRadius={8}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
            </PieChart>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-3xl font-bold text-foreground">{completionPercentage}%</span>
             <span className="text-sm text-muted-foreground">已完成</span>
          </div>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center text-sm">
              <span
                className="mr-2 h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}
              ></span>
              <span>{entry.name} (${entry.value.toLocaleString()})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
