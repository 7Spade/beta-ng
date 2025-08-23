/**
 * Contract Context Module
 * Exports all contract context related components and hooks
 */

// Main context and provider
export {
  ContractContext,
  ContractProvider as BaseContractProvider,
  useContractContext,
  type ContractContextValue,
  type ContractProviderProps,
  type ContractState,
  type ContractAction,
} from './contract.context';

// Enhanced providers
export {
  ContractProvider,
  ContractProviderLite,
  ContractProviderWithFilters,
  ActiveContractsProvider,
  CompletedContractsProvider,
  ClientContractsProvider,
  DateRangeContractsProvider,
  type ContractProviderWithErrorProps,
} from './contract.provider';

// Convenience hooks for specific use cases
export { useContractContext as useContracts } from './contract.context';

// Re-export related types
export type {
  Contract,
  ContractFilters,
  ContractStats,
  ContractStatus,
} from '../../types/entities/contract.types';

export type {
  CreateContractDto,
  UpdateContractDto,
} from '../../types/dto/contract.dto';

export type {
  DashboardStats,
  ExportOptions,
} from '../../types/services/contract.service.types';