/**
 * Project Entity Types
 * Defines the structure and types for project-related entities
 */

import { BaseEntity } from './shared.types';

export type TaskStatus = '待處理' | '進行中' | '已完成';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  lastUpdated: string;
  subTasks: Task[];
  value: number; // Calculated as quantity * unitPrice
  quantity: number;
  unitPrice: number;
}

export interface Project extends BaseEntity {
  customId?: string;
  title: string;
  description: string;
  client?: string;
  clientRepresentative?: string;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
  value: number;
}

export interface ProjectFilters {
  client?: string;
  status?: 'active' | 'completed' | 'on-hold';
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  valueRange?: {
    min: number;
    max: number;
  };
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalValue: number;
  averageValue: number;
  completionRate: number;
}