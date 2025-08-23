/**
 * Project Data Transfer Objects (DTOs)
 * Defines the structure for data transfer in project operations
 */

import { Task } from '../entities/project.types';

export interface CreateProjectDto {
  customId?: string;
  title: string;
  description: string;
  client?: string;
  clientRepresentative?: string;
  startDate: Date;
  endDate: Date;
  tasks?: Task[];
  value: number;
}

export interface UpdateProjectDto {
  customId?: string;
  title?: string;
  description?: string;
  client?: string;
  clientRepresentative?: string;
  startDate?: Date;
  endDate?: Date;
  tasks?: Task[];
  value?: number;
}

export interface CreateProjectFromDocumentDto {
  customId: string;
  title: string;
  description: string;
  client: string;
  clientRepresentative: string;
  tasks: Task[];
  totalValue: number;
  startDate: Date;
  endDate: Date;
}