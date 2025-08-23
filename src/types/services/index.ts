/**
 * Service types index
 * Exports all service-related type definitions
 */

// Explicitly export to avoid conflicts
export type { 
  DashboardStats, 
  ExportOptions, 
  IContractService, 
  IContractStatsService, 
  IContractExportService,
  ValidationResult,
  ValidationError
} from './contract.service.types';

export type { 
  IProjectService 
} from './project.service.types';

export type { 
  IBaseRepository, 
  IFirebaseRepository,
  RepositoryConfig,
  QueryOptions,
  WhereClause,
  RepositoryError
} from './repository.types';