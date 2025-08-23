/**
 * Contract Service Implementation
 * Handles contract-related business logic operations
 */

import { Contract, ContractFilters } from '../../types/entities/contract.types';
import { CreateContractDto, UpdateContractDto } from '../../types/dto/contract.dto';
import {
  IContractService,
  DashboardStats,
  ExportOptions,
} from '../../types/services/contract.service.types';
import { 
  ValidationResult, 
  ValidationError,
  validateCreateContract,
  validateUpdateContract,
  validateStatusTransition,
  validateContractBusinessRules
} from '../../utils/validation';
import { ContractRepository } from '../../repositories/contracts/contract.repository';
import { ContractStatsService } from './contract-stats.service';
import { ContractExportService } from './contract-export.service';

/**
 * Contract Service Implementation
 */
export class ContractService implements IContractService {
  private contractRepository: ContractRepository;
  private contractStatsService: ContractStatsService;
  private contractExportService: ContractExportService;

  constructor(
    contractRepository?: ContractRepository,
    contractStatsService?: ContractStatsService,
    contractExportService?: ContractExportService
  ) {
    this.contractRepository = contractRepository || new ContractRepository();
    this.contractStatsService = contractStatsService || new ContractStatsService();
    this.contractExportService = contractExportService || new ContractExportService();
  }

  /**
   * Create a new contract
   */
  async createContract(contractData: CreateContractDto): Promise<Contract> {
    try {
      // Validate contract data
      const validationResult = this.validateContract(contractData);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      // Set default values
      const contractToCreate = {
        ...contractData,
        status: contractData.status || '啟用中' as const,
        payments: contractData.payments || [],
        changeOrders: contractData.changeOrders || [],
        versions: [{
          version: 1,
          date: new Date(),
          changeSummary: 'Initial contract creation'
        }],
      };

      // Create contract through repository
      const createdContract = await this.contractRepository.create(contractToCreate);
      
      return createdContract;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw new Error(`Failed to create contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing contract
   */
  async updateContract(id: string, updates: UpdateContractDto): Promise<Contract> {
    try {
      // Get existing contract
      const existingContract = await this.contractRepository.findById(id);
      if (!existingContract) {
        throw new Error(`Contract with ID ${id} not found`);
      }

      // Validate updates
      const mergedContract = { ...existingContract, ...updates };
      const validationResult = this.validateContract(mergedContract);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      // Add version history if significant changes
      const updatedContract = { ...updates };
      if (this.hasSignificantChanges(existingContract, updates)) {
        const newVersion = {
          version: (existingContract.versions?.length || 0) + 1,
          date: new Date(),
          changeSummary: this.generateChangeSummary(existingContract, updates)
        };
        
        updatedContract.versions = [...(existingContract.versions || []), newVersion];
      }

      // Update contract through repository
      const result = await this.contractRepository.update(id, updatedContract);
      
      return result;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw new Error(`Failed to update contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a contract
   */
  async deleteContract(id: string): Promise<void> {
    try {
      const existingContract = await this.contractRepository.findById(id);
      if (!existingContract) {
        throw new Error(`Contract with ID ${id} not found`);
      }

      // Check if contract can be deleted (business rules)
      if (existingContract.status === '啟用中') {
        throw new Error('Cannot delete active contracts. Please terminate the contract first.');
      }

      await this.contractRepository.delete(id);
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw new Error(`Failed to delete contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a single contract by ID
   */
  async getContract(id: string): Promise<Contract | null> {
    try {
      return await this.contractRepository.findById(id);
    } catch (error) {
      console.error('Error getting contract:', error);
      throw new Error(`Failed to get contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get contracts with optional filters
   */
  async getContracts(filters?: ContractFilters): Promise<Contract[]> {
    try {
      if (filters) {
        const result = await this.contractRepository.findContracts({ filters });
        return result.contracts;
      } else {
        return await this.contractRepository.findAll();
      }
    } catch (error) {
      console.error('Error getting contracts:', error);
      throw new Error(`Failed to get contracts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate contract data
   */
  validateContract(contract: Partial<Contract>): ValidationResult {
    // Use the validation utilities for comprehensive validation
    if (this.isCreateContractDto(contract)) {
      const createValidation = validateCreateContract(contract);
      const businessValidation = validateContractBusinessRules(contract);
      
      return {
        isValid: createValidation.isValid && businessValidation.isValid,
        errors: [...createValidation.errors, ...businessValidation.errors]
      };
    } else {
      const updateValidation = validateUpdateContract(contract as UpdateContractDto);
      const businessValidation = validateContractBusinessRules(contract);
      
      return {
        isValid: updateValidation.isValid && businessValidation.isValid,
        errors: [...updateValidation.errors, ...businessValidation.errors]
      };
    }
  }

  /**
   * Type guard to check if contract data is for creation
   */
  private isCreateContractDto(contract: Partial<Contract>): contract is CreateContractDto {
    return contract.name !== undefined && 
           contract.contractor !== undefined && 
           contract.client !== undefined &&
           contract.startDate !== undefined &&
           contract.endDate !== undefined &&
           contract.totalValue !== undefined &&
           contract.scope !== undefined;
  }

  /**
   * Calculate contract value (including change orders)
   */
  calculateContractValue(contract: Contract): number {
    let totalValue = contract.totalValue;

    // Add approved change orders
    if (contract.changeOrders) {
      const approvedChangeOrders = contract.changeOrders.filter(co => co.status === '已核准');
      totalValue += approvedChangeOrders.reduce((sum, co) => sum + co.impact.cost, 0);
    }

    return totalValue;
  }

  /**
   * Update contract status
   */
  async updateContractStatus(id: string, status: Contract['status']): Promise<Contract> {
    try {
      const existingContract = await this.contractRepository.findById(id);
      if (!existingContract) {
        throw new Error(`Contract with ID ${id} not found`);
      }

      // Validate status transition
      this.validateStatusTransition(existingContract.status, status);

      const updates: UpdateContractDto = { status };
      
      // Add version history for status changes
      const newVersion = {
        version: (existingContract.versions?.length || 0) + 1,
        date: new Date(),
        changeSummary: `Status changed from ${existingContract.status} to ${status}`
      };
      
      updates.versions = [...(existingContract.versions || []), newVersion];

      return await this.contractRepository.update(id, updates);
    } catch (error) {
      console.error('Error updating contract status:', error);
      throw new Error(`Failed to update contract status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get contract dashboard statistics
   */
  async getContractDashboardStats(): Promise<DashboardStats> {
    try {
      return await this.contractStatsService.getContractDashboardStats();
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error(`Failed to get dashboard stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get contract statistics with filters
   */
  async getContractStats(filters?: ContractFilters) {
    try {
      return await this.contractRepository.getContractStats();
    } catch (error) {
      console.error('Error getting contract stats:', error);
      throw new Error(`Failed to get contract stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export contracts
   */
  async exportContracts(contracts: Contract[], options: ExportOptions): Promise<void> {
    try {
      switch (options.format) {
        case 'csv':
          ContractExportService.exportContractsToCSV(contracts, {
            includePayments: options.includePayments,
            includeChangeOrders: options.includeChangeOrders,
            dateRange: options.dateRange,
            statusFilter: options.filters?.status ? [options.filters.status] : undefined
          });
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}. Only CSV is currently supported.`);
      }
    } catch (error) {
      console.error('Error exporting contracts:', error);
      throw new Error(`Failed to export contracts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if updates contain significant changes that warrant version history
   */
  private hasSignificantChanges(existing: Contract, updates: UpdateContractDto): boolean {
    const significantFields = ['name', 'totalValue', 'startDate', 'endDate', 'scope', 'status'];
    
    return significantFields.some(field => {
      const existingValue = existing[field as keyof Contract];
      const updatedValue = updates[field as keyof UpdateContractDto];
      
      if (updatedValue === undefined) return false;
      
      // Handle date comparison
      if (existingValue instanceof Date && updatedValue instanceof Date) {
        return existingValue.getTime() !== updatedValue.getTime();
      }
      
      return existingValue !== updatedValue;
    });
  }

  /**
   * Generate change summary for version history
   */
  private generateChangeSummary(existing: Contract, updates: UpdateContractDto): string {
    const changes: string[] = [];
    
    if (updates.name && updates.name !== existing.name) {
      changes.push(`Name changed to "${updates.name}"`);
    }
    
    if (updates.totalValue !== undefined && updates.totalValue !== existing.totalValue) {
      changes.push(`Total value changed to ${updates.totalValue}`);
    }
    
    if (updates.status && updates.status !== existing.status) {
      changes.push(`Status changed to ${updates.status}`);
    }
    
    if (updates.startDate && updates.startDate.getTime() !== existing.startDate.getTime()) {
      changes.push(`Start date changed to ${updates.startDate.toLocaleDateString()}`);
    }
    
    if (updates.endDate && updates.endDate.getTime() !== existing.endDate.getTime()) {
      changes.push(`End date changed to ${updates.endDate.toLocaleDateString()}`);
    }
    
    return changes.length > 0 ? changes.join(', ') : 'Contract updated';
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: Contract['status'], newStatus: Contract['status']): void {
    const validationResult = validateStatusTransition(currentStatus, newStatus);
    
    if (!validationResult.isValid) {
      const errorMessages = validationResult.errors.map(error => error.message).join(', ');
      throw new Error(`Invalid status transition: ${errorMessages}`);
    }
  }
}

// Export singleton instance
export const contractService = new ContractService();