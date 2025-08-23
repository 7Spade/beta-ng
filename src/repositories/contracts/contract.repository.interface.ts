/**
 * Contract Repository Interface
 * Defines all contract-specific data access operations
 */

import { Contract, ContractStatus, ContractStats, ContractFilters } from '../../types/entities/contract.types';
import { IFirebaseRepository } from '../../types/services/repository.types';
import { PaginationOptions, PaginatedResult } from '../../types/entities/shared.types';
import { 
  FindContractsByStatusParams,
  FindContractsByDateRangeParams,
  FindContractsByClientParams,
  FindContractsParams,
  ContractQueryResult,
  ContractSubscriptionCallback,
  ContractStatsSubscriptionCallback,
  BatchUpdateItem
} from './contract.types';

/**
 * Contract Repository Interface
 * Extends base Firebase repository with contract-specific operations
 */
export interface IContractRepository extends IFirebaseRepository<Contract> {
  /**
   * Find contracts by status
   */
  findByStatus(params: FindContractsByStatusParams): Promise<ContractQueryResult>;

  /**
   * Find contracts by date range
   */
  findByDateRange(params: FindContractsByDateRangeParams): Promise<ContractQueryResult>;

  /**
   * Find contracts by client name
   */
  findByClient(params: FindContractsByClientParams): Promise<ContractQueryResult>;

  /**
   * Find contracts with complex filters
   */
  findContracts(params: FindContractsParams): Promise<ContractQueryResult>;

  /**
   * Get contract statistics and aggregations
   */
  getContractStats(): Promise<ContractStats>;

  /**
   * Subscribe to contract changes with filters
   */
  subscribeToContracts(
    filters?: ContractFilters,
    callback?: ContractSubscriptionCallback
  ): () => void;

  /**
   * Subscribe to contract statistics changes
   */
  subscribeToContractStats(callback: ContractStatsSubscriptionCallback): () => void;

  /**
   * Batch update multiple contracts
   */
  batchUpdateContracts(updates: BatchUpdateItem[]): Promise<void>;

  /**
   * Get contracts by multiple IDs
   */
  findByIds(ids: string[]): Promise<Contract[]>;

  /**
   * Search contracts by text (name, client, contractor, scope)
   */
  searchContracts(searchTerm: string, pagination?: PaginationOptions): Promise<ContractQueryResult>;

  /**
   * Get active contracts count
   */
  getActiveContractsCount(): Promise<number>;

  /**
   * Get contracts expiring soon
   */
  getExpiringContracts(daysAhead: number): Promise<Contract[]>;

  /**
   * Get contract value statistics by status
   */
  getValueStatsByStatus(): Promise<Record<ContractStatus, number>>;

  /**
   * Archive old contracts (soft delete)
   */
  archiveOldContracts(cutoffDate: Date): Promise<number>;
}