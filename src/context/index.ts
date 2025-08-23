/**
 * Context Module
 * Central export point for all application contexts
 */

// Shared contexts
export * from './shared';

// Contract contexts
export * from './contracts';

// Project context (existing)
export { ProjectProvider, useProjects } from './ProjectContext';

// Re-export commonly used types
export type {
  Contract,
  ContractFilters,
  ContractStats,
  Project,
  Task,
  TaskStatus,
} from '../types/entities';

export type {
  CreateContractDto,
  UpdateContractDto,
} from '../types/dto';