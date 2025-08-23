/**
 * Contract Statistics Service
 * Handles contract-related statistics and analytics calculations
 */

import { Contract, ContractFilters } from '../../types/entities/contract.types';
import { DashboardStats, IContractStatsService } from '../../types/services/contract.service.types';
import { ContractRepository } from '../../repositories/contracts/contract.repository';

/**
 * Contract Statistics Service Implementation
 */
export class ContractStatsService implements IContractStatsService {
  private contractRepository: ContractRepository;

  constructor(contractRepository?: ContractRepository) {
    this.contractRepository = contractRepository || new ContractRepository();
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getContractDashboardStats(): Promise<DashboardStats> {
    try {
      // Get all contracts for comprehensive statistics
      const allContracts = await this.contractRepository.findAll();
      
      // Calculate basic statistics
      const totalContracts = allContracts.length;
      const activeContracts = allContracts.filter(c => c.status === '啟用中').length;
      const completedContracts = allContracts.filter(c => c.status === '已完成').length;
      const totalValue = allContracts.reduce((acc, contract) => acc + this.calculateContractValue(contract), 0);
      const averageValue = totalContracts > 0 ? totalValue / totalContracts : 0;

      // Calculate monthly revenue (current month)
      const monthlyRevenue = this.calculateMonthlyRevenue(allContracts);

      // Get status distribution
      const statusDistribution = this.getStatusDistribution(allContracts);

      // Get recent contracts (last 5)
      const recentContracts = this.getRecentContracts(allContracts, 5);

      return {
        totalContracts,
        activeContracts,
        completedContracts,
        totalValue,
        averageValue,
        monthlyRevenue,
        statusDistribution,
        recentContracts,
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      throw new Error(`Failed to calculate dashboard stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate contract value including approved change orders
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
   * Calculate monthly revenue for current month
   */
  calculateMonthlyRevenue(contracts: Contract[]): number {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate revenue from contracts that are active in current month
    return contracts
      .filter(contract => {
        const startDate = new Date(contract.startDate);
        const endDate = new Date(contract.endDate);
        
        // Check if contract is active during current month
        const contractStartsBeforeOrDuringMonth = 
          startDate.getFullYear() < currentYear || 
          (startDate.getFullYear() === currentYear && startDate.getMonth() <= currentMonth);
        
        const contractEndsAfterOrDuringMonth = 
          endDate.getFullYear() > currentYear || 
          (endDate.getFullYear() === currentYear && endDate.getMonth() >= currentMonth);

        return contractStartsBeforeOrDuringMonth && contractEndsAfterOrDuringMonth;
      })
      .reduce((total, contract) => {
        // Calculate monthly portion of contract value
        const contractValue = this.calculateContractValue(contract);
        const contractDurationMonths = this.getContractDurationInMonths(contract);
        const monthlyValue = contractDurationMonths > 0 ? contractValue / contractDurationMonths : contractValue;
        
        return total + monthlyValue;
      }, 0);
  }

  /**
   * Get status distribution across all contracts
   */
  getStatusDistribution(contracts: Contract[]): Record<string, number> {
    const distribution: Record<string, number> = {
      '啟用中': 0,
      '已完成': 0,
      '暫停中': 0,
      '已終止': 0,
    };

    contracts.forEach(contract => {
      distribution[contract.status] = (distribution[contract.status] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Get recent contracts sorted by creation date
   */
  getRecentContracts(contracts: Contract[], limit: number = 5): Contract[] {
    return contracts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Calculate contract duration in months
   */
  private getContractDurationInMonths(contract: Contract): number {
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);
    
    const yearDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endDate.getMonth() - startDate.getMonth();
    
    return yearDiff * 12 + monthDiff + 1; // +1 to include both start and end months
  }

  /**
   * Get contracts by value range
   */
  async getContractsByValueRange(minValue: number, maxValue: number): Promise<Contract[]> {
    try {
      const filters: ContractFilters = {
        minValue,
        maxValue,
      };
      
      const result = await this.contractRepository.findContracts({ filters });
      return result.contracts;
    } catch (error) {
      console.error('Error getting contracts by value range:', error);
      throw new Error(`Failed to get contracts by value range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get contract performance metrics
   */
  async getContractPerformanceMetrics(): Promise<{
    onTimeCompletionRate: number;
    averageContractDuration: number;
    totalChangeOrderImpact: number;
    averageChangeOrdersPerContract: number;
  }> {
    try {
      const allContracts = await this.contractRepository.findAll();
      const completedContracts = allContracts.filter(c => c.status === '已完成');

      // Calculate on-time completion rate
      const onTimeCompletions = completedContracts.filter(contract => {
        // Assuming we have a completion date field or use updatedAt for completed contracts
        const actualEndDate = new Date(contract.updatedAt);
        const plannedEndDate = new Date(contract.endDate);
        return actualEndDate <= plannedEndDate;
      });
      
      const onTimeCompletionRate = completedContracts.length > 0 
        ? (onTimeCompletions.length / completedContracts.length) * 100 
        : 0;

      // Calculate average contract duration
      const totalDuration = allContracts.reduce((sum, contract) => {
        return sum + this.getContractDurationInMonths(contract);
      }, 0);
      
      const averageContractDuration = allContracts.length > 0 
        ? totalDuration / allContracts.length 
        : 0;

      // Calculate change order impact
      const totalChangeOrderImpact = allContracts.reduce((sum, contract) => {
        if (!contract.changeOrders) return sum;
        
        const approvedChangeOrders = contract.changeOrders.filter(co => co.status === '已核准');
        return sum + approvedChangeOrders.reduce((coSum, co) => coSum + co.impact.cost, 0);
      }, 0);

      // Calculate average change orders per contract
      const totalChangeOrders = allContracts.reduce((sum, contract) => {
        return sum + (contract.changeOrders?.length || 0);
      }, 0);
      
      const averageChangeOrdersPerContract = allContracts.length > 0 
        ? totalChangeOrders / allContracts.length 
        : 0;

      return {
        onTimeCompletionRate,
        averageContractDuration,
        totalChangeOrderImpact,
        averageChangeOrdersPerContract,
      };
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      throw new Error(`Failed to calculate performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get revenue trends over time
   */
  async getRevenueTrends(months: number = 12): Promise<Array<{
    month: string;
    revenue: number;
    contractCount: number;
  }>> {
    try {
      const allContracts = await this.contractRepository.findAll();
      const trends: Array<{ month: string; revenue: number; contractCount: number }> = [];
      
      const currentDate = new Date();
      
      for (let i = months - 1; i >= 0; i--) {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const targetMonth = targetDate.getMonth();
        const targetYear = targetDate.getFullYear();
        
        // Filter contracts active in this month
        const activeContractsInMonth = allContracts.filter(contract => {
          const startDate = new Date(contract.startDate);
          const endDate = new Date(contract.endDate);
          
          const contractStartsBeforeOrDuringMonth = 
            startDate.getFullYear() < targetYear || 
            (startDate.getFullYear() === targetYear && startDate.getMonth() <= targetMonth);
          
          const contractEndsAfterOrDuringMonth = 
            endDate.getFullYear() > targetYear || 
            (endDate.getFullYear() === targetYear && endDate.getMonth() >= targetMonth);

          return contractStartsBeforeOrDuringMonth && contractEndsAfterOrDuringMonth;
        });

        // Calculate revenue for this month
        const monthlyRevenue = activeContractsInMonth.reduce((total, contract) => {
          const contractValue = this.calculateContractValue(contract);
          const contractDurationMonths = this.getContractDurationInMonths(contract);
          const monthlyValue = contractDurationMonths > 0 ? contractValue / contractDurationMonths : contractValue;
          
          return total + monthlyValue;
        }, 0);

        trends.push({
          month: targetDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short' }),
          revenue: monthlyRevenue,
          contractCount: activeContractsInMonth.length,
        });
      }
      
      return trends;
    } catch (error) {
      console.error('Error calculating revenue trends:', error);
      throw new Error(`Failed to calculate revenue trends: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get top clients by contract value
   */
  async getTopClientsByValue(limit: number = 10): Promise<Array<{
    client: string;
    totalValue: number;
    contractCount: number;
  }>> {
    try {
      const allContracts = await this.contractRepository.findAll();
      
      // Group contracts by client
      const clientStats = new Map<string, { totalValue: number; contractCount: number }>();
      
      allContracts.forEach(contract => {
        const client = contract.client;
        const contractValue = this.calculateContractValue(contract);
        
        if (clientStats.has(client)) {
          const existing = clientStats.get(client)!;
          clientStats.set(client, {
            totalValue: existing.totalValue + contractValue,
            contractCount: existing.contractCount + 1,
          });
        } else {
          clientStats.set(client, {
            totalValue: contractValue,
            contractCount: 1,
          });
        }
      });

      // Convert to array and sort by total value
      return Array.from(clientStats.entries())
        .map(([client, stats]) => ({
          client,
          totalValue: stats.totalValue,
          contractCount: stats.contractCount,
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top clients:', error);
      throw new Error(`Failed to get top clients: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const contractStatsService = new ContractStatsService();