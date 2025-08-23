/**
 * Project Service Implementation
 * Handles project-related business logic operations
 */

import { Project, ProjectFilters, ProjectStats } from '../../types/entities/project.types';
import { CreateProjectDto, UpdateProjectDto, CreateProjectFromDocumentDto } from '../../types/dto/project.dto';
import {
  IProjectService,
  ValidationResult,
  ValidationError,
} from '../../types/services/project.service.types';
import { ProjectRepository } from '../../repositories/projects/project.repository';

/**
 * Project Service Implementation
 */
export class ProjectService implements IProjectService {
  private projectRepository: ProjectRepository;

  constructor(projectRepository?: ProjectRepository) {
    this.projectRepository = projectRepository || new ProjectRepository();
  }

  /**
   * Create a new project
   */
  async createProject(projectData: CreateProjectDto): Promise<Project> {
    try {
      // Validate project data
      const validationResult = this.validateProject(projectData);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      // Set default values
      const projectToCreate = {
        ...projectData,
        tasks: projectData.tasks || [],
      };

      // Create project through repository
      const createdProject = await this.projectRepository.create(projectToCreate);
      
      return createdProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create project from document data (used by server actions)
   */
  async createProjectFromDocument(projectData: CreateProjectFromDocumentDto): Promise<Project> {
    try {
      const createDto: CreateProjectDto = {
        customId: projectData.customId,
        title: projectData.title,
        description: projectData.description,
        client: projectData.client,
        clientRepresentative: projectData.clientRepresentative,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        tasks: projectData.tasks,
        value: projectData.totalValue,
      };

      return await this.createProject(createDto);
    } catch (error) {
      console.error('Error creating project from document:', error);
      throw new Error(`Failed to create project from document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(id: string, updates: UpdateProjectDto): Promise<Project> {
    try {
      // Get existing project
      const existingProject = await this.projectRepository.findById(id);
      if (!existingProject) {
        throw new Error(`Project with ID ${id} not found`);
      }

      // Validate updates
      const mergedProject = { ...existingProject, ...updates };
      const validationResult = this.validateProject(mergedProject);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      // Update project through repository
      const result = await this.projectRepository.update(id, updates);
      
      return result;
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error(`Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      const existingProject = await this.projectRepository.findById(id);
      if (!existingProject) {
        throw new Error(`Project with ID ${id} not found`);
      }

      // Check if project can be deleted (business rules)
      const now = new Date();
      if (existingProject.startDate <= now && existingProject.endDate >= now) {
        throw new Error('Cannot delete active projects. Please complete or cancel the project first.');
      }

      await this.projectRepository.delete(id);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a single project by ID
   */
  async getProject(id: string): Promise<Project | null> {
    try {
      return await this.projectRepository.findById(id);
    } catch (error) {
      console.error('Error getting project:', error);
      throw new Error(`Failed to get project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get projects with optional filters
   */
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    try {
      if (filters) {
        const result = await this.projectRepository.findProjects({ filters });
        return result.projects;
      } else {
        return await this.projectRepository.findAll();
      }
    } catch (error) {
      console.error('Error getting projects:', error);
      throw new Error(`Failed to get projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(filters?: ProjectFilters): Promise<ProjectStats> {
    try {
      return await this.projectRepository.getProjectStats();
    } catch (error) {
      console.error('Error getting project stats:', error);
      throw new Error(`Failed to get project stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate project data
   */
  validateProject(project: Partial<Project>): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields validation
    if (!project.title || project.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Project title is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!project.description || project.description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Project description is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!project.startDate) {
      errors.push({
        field: 'startDate',
        message: 'Project start date is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!project.endDate) {
      errors.push({
        field: 'endDate',
        message: 'Project end date is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (project.value === undefined || project.value < 0) {
      errors.push({
        field: 'value',
        message: 'Project value must be a non-negative number',
        code: 'INVALID_VALUE'
      });
    }

    // Date validation
    if (project.startDate && project.endDate) {
      if (project.startDate >= project.endDate) {
        errors.push({
          field: 'endDate',
          message: 'End date must be after start date',
          code: 'INVALID_DATE_RANGE'
        });
      }
    }

    // Title length validation
    if (project.title && project.title.length > 200) {
      errors.push({
        field: 'title',
        message: 'Project title cannot exceed 200 characters',
        code: 'FIELD_TOO_LONG'
      });
    }

    // Description length validation
    if (project.description && project.description.length > 2000) {
      errors.push({
        field: 'description',
        message: 'Project description cannot exceed 2000 characters',
        code: 'FIELD_TOO_LONG'
      });
    }

    // Client name validation
    if (project.client && project.client.length > 100) {
      errors.push({
        field: 'client',
        message: 'Client name cannot exceed 100 characters',
        code: 'FIELD_TOO_LONG'
      });
    }

    // Tasks validation
    if (project.tasks) {
      project.tasks.forEach((task, index) => {
        if (!task.title || task.title.trim().length === 0) {
          errors.push({
            field: `tasks[${index}].title`,
            message: `Task ${index + 1} title is required`,
            code: 'REQUIRED_FIELD'
          });
        }

        if (task.quantity <= 0) {
          errors.push({
            field: `tasks[${index}].quantity`,
            message: `Task ${index + 1} quantity must be greater than 0`,
            code: 'INVALID_VALUE'
          });
        }

        if (task.unitPrice < 0) {
          errors.push({
            field: `tasks[${index}].unitPrice`,
            message: `Task ${index + 1} unit price cannot be negative`,
            code: 'INVALID_VALUE'
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate total project value from tasks
   */
  calculateProjectValue(project: Project): number {
    if (!project.tasks || project.tasks.length === 0) {
      return project.value || 0;
    }

    return project.tasks.reduce((total, task) => {
      return total + (task.quantity * task.unitPrice);
    }, 0);
  }

  /**
   * Get project completion percentage
   */
  getProjectCompletionPercentage(project: Project): number {
    if (!project.tasks || project.tasks.length === 0) {
      return 0;
    }

    const completedTasks = project.tasks.filter(task => task.status === '已完成').length;
    return (completedTasks / project.tasks.length) * 100;
  }

  /**
   * Check if project is active
   */
  isProjectActive(project: Project): boolean {
    const now = new Date();
    return project.startDate <= now && project.endDate >= now;
  }

  /**
   * Check if project is overdue
   */
  isProjectOverdue(project: Project): boolean {
    const now = new Date();
    return project.endDate < now && this.getProjectCompletionPercentage(project) < 100;
  }
}

// Export singleton instance
export const projectService = new ProjectService();