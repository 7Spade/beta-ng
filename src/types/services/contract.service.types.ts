/**
 * Contract service interface types
 * Defines the contract for contract-related business logic services
 */

import { Contract, ContractStats, ContractFilters, DateRange } from '../entities/contract.types';
import { CreateContractDto, UpdateContractDto } from '../dto';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Dashboard statistics interface
export interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  totalValue: number;
  averageValue: number;
  monthlyRevenue: number;
  statusDistribution: Record<string, number>;
  recentContracts: Contract[];
}

// Export options interface
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filename?: string;
  includePayments?: boolean;
  includeChangeOrders?: boolean;
  dateRange?: DateRange;
  filters?: ContractFilters;
}

// Contract service interface
export interface IContractService {
  // Core CRUD operations
  createContract(contractData: CreateContractDto): Promise<Contract>;
  updateContract(id: string, updates: UpdateContractDto): Promise<Contract>;
  deleteContract(id: string): Promise<void>;
  getContract(id: string): Promise<Contract | null>;
  getContracts(filters?: ContractFilters): Promise<Contract[]>;

  // Business logic operations
  validateContract(contract: Partial<Contract>): ValidationResult;
  calculateContractValue(contract: Contract): number;
  updateContractStatus(id: string, status: Contract['status']): Promise<Contract>;
  
  // Statistics and analytics
  getContractDashboardStats(): Promise<DashboardStats>;
  getContractStats(filters?: ContractFilters): Promise<ContractStats>;
  
  // Export functionality
  exportContracts(contracts: Contract[], options: ExportOptions): Promise<void>;
}

// Contract statistics service interface
export interface IContractStatsService {
  getContractDashboardStats(): Promise<DashboardStats>;
  calculateContractValue(contract: Contract): number;
  calculateMonthlyRevenue(contracts: Contract[]): number;
  getStatusDistribution(contracts: Contract[]): Record<string, number>;
  getRecentContracts(contracts: Contract[], limit?: number): Contract[];
}

// Contract export service interface
export interface IContractExportService {
  exportContractsToCSV(contracts: Contract[], options?: any): void;
  exportContractsWithPayments(contracts: Contract[], options?: any): void;
  exportContractsWithChangeOrders(contracts: Contract[], options?: any): void;
  exportContractSummary(contracts: Contract[], options?: any): void;
}