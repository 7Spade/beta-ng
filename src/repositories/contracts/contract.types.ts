/**
 * Contract repository specific types
 * These types are used specifically for repository operations
 */

import { Contract, ContractStatus, ContractStats, ContractFilters, DateRange } from '../../types/entities/contract.types';
import { PaginationOptions, PaginatedResult } from '../../types/entities/shared.types';

// Repository method parameter types
export interface FindContractsByStatusParams {
  status: ContractStatus;
  pagination?: PaginationOptions;
}

export interface FindContractsByDateRangeParams {
  dateRange: DateRange;
  pagination?: PaginationOptions;
}

export interface FindContractsByClientParams {
  clientName: string;
  pagination?: PaginationOptions;
}

export interface FindContractsParams {
  filters?: ContractFilters;
  pagination?: PaginationOptions;
}

// Repository result types
export interface ContractQueryResult {
  contracts: Contract[];
  total: number;
}

// Subscription callback types
export type ContractSubscriptionCallback = (contracts: Contract[]) => void;
export type ContractStatsSubscriptionCallback = (stats: ContractStats) => void;

// Batch operation types
export interface BatchUpdateItem {
  id: string;
  data: Partial<Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>>;
}

export interface BatchDeleteItem {
  id: string;
}

// Firebase specific types
export interface FirestoreContractData {
  customId?: string;
  name: string;
  contractor: string;
  client: string;
  clientRepresentative?: string;
  startDate: any; // Firestore Timestamp
  endDate: any; // Firestore Timestamp
  totalValue: number;
  status: ContractStatus;
  scope: string;
  payments: any[]; // Will be transformed
  changeOrders: any[]; // Will be transformed
  versions: any[]; // Will be transformed
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

// Repository configuration types
export interface ContractRepositoryConfig {
  collectionName: string;
  enableCache: boolean;
  cacheTimeout: number;
}