/**
 * Project Service Interface Types
 * Defines the contracts for project-related services
 */

import { Project, ProjectFilters, ProjectStats } from '../entities/project.types';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';

export interface IProjectService {
  createProject(projectData: CreateProjectDto): Promise<Project>;
  updateProject(id: string, updates: UpdateProjectDto): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getProject(id: string): Promise<Project | null>;
  getProjects(filters?: ProjectFilters): Promise<Project[]>;
  getProjectStats(filters?: ProjectFilters): Promise<ProjectStats>;
  validateProject(project: Partial<Project>): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}