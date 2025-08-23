// Type exports
export * from './entities';
export * from './dto';

// Explicitly export services to avoid conflicts
export type { 
  DashboardStats, 
  ExportOptions, 
  IContractService, 
  IContractStatsService, 
  IContractExportService 
} from './services/contract.service.types';
export type { 
  IProjectService 
} from './services/project.service.types';
export type { 
  IBaseRepository, 
  IFirebaseRepository,
  RepositoryConfig,
  QueryOptions 
} from './services/repository.types';

// Re-export validation types from utils to maintain compatibility
export type { ValidationResult, ValidationError } from '../utils/validation/common.validation';