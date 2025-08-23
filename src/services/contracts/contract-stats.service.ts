/**
 * Contract Statistics Service Implementation
 * Handles contract-related statistics and analytics calculations
 */

import { Contract } from '../../types/entities/contract.types';
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
      const contracts = await this.contractRepository.findAll();
      
      // Calculate basic statistics
      const totalContracts = contracts.length;
      const activeContracts = contracts.filter(c => c.status === '啟用中').length;
      const completedContracts = contracts.filter(c => c.status === '已完成').length;
      
      // Calculate total value including change orders
      const totalValue = contracts.reduce((acc, contract) => {
        return acc + this.calculateContractValue(contract);
      }, 0);
      
      // Calculate average value
      const averageValue = totalContracts > 0 ? totalValue / totalContracts : 0;
      
      // Calculate monthly revenue (from active contracts)
      const monthlyRevenue = this.calculateMonthlyRevenue(contracts);
      
      // Get status distribution
      const statusDistribution = this.getStatusDistribution(contracts);
      
      // Get recent contracts (last 5)
      const recentContracts = this.getRecentContracts(contracts, 5);

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
      console.error('Error getting contract dashboard stats:', error);
      throw new Error(`Failed to get dashboard statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate contract value including approved change orders
   */
  calculateContractValue(contract: Contract): number {
    let totalValue = contract.totalValue;

    // Add approved change orders
    if (contract.changeOrders && contract.changeOrders.length > 0) {
      const approvedChangeOrders = contract.changeOrders.filter(co => co.status === '已核准');
      totalValue += approvedChangeOrders.reduce((sum, co) => sum + co.impact.cost, 0);
    }

    return totalValue;
  }

  /**
   * Calculate monthly revenue from active contracts
   */
  calculateMonthlyRevenue(contracts: Contract[]): number {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Filter contracts that are active and have payments in current month
    const activeContracts = contracts.filter(c => c.status === '啟用中');
    
    let monthlyRevenue = 0;

    activeContracts.forEach(contract => {
      if (contract.payments && contract.payments.length > 0) {
        // Sum payments made in current month
        const currentMonthPayments = contract.payments.filter(payment => {
          if (!payment.paidDate) return false;
          
          const paymentDate = payment.paidDate instanceof Date ? payment.paidDate : new Date(payment.paidDate);
          return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        });

        monthlyRevenue += currentMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
      } else {
        // If no payments recorded, estimate based on contract duration
        const contractValue = this.calculateContractValue(contract);
        const startDate = contract.startDate instanceof Date ? contract.startDate : new Date(contract.startDate);
        const endDate = contract.endDate instanceof Date ? contract.endDate : new Date(contract.endDate);
        
        // Calculate contract duration in months
        const durationMonths = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        
        // Check if current month is within contract period
        const contractStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const contractEnd = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        const currentMonthStart = new Date(currentYear, currentMonth, 1);
        
        if (currentMonthStart >= contractStart && currentMonthStart <= contractEnd) {
          monthlyRevenue += contractValue / durationMonths;
        }
      }
    });

    return monthlyRevenue;
  }

  /**
   * Get distribution of contracts by status
   */
  getStatusDistribution(contracts: Contract[]): Record<string, number> {
    const distribution: Record<string, number> = {
      '啟用中': 0,
      '已完成': 0,
      '暫停中': 0,
      '已終止': 0,
    };

    contracts.forEach(contract => {
      if (distribution.hasOwnProperty(contract.status)) {
        distribution[contract.status]++;
      } else {
        distribution[contract.status] = 1;
      }
    });

    return distribution;
  }

  /**
   * Get most recent contracts
   */
  getRecentContracts(contracts: Contract[], limit: number = 5): Contract[] {
    return contracts
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  /**
   * Calculate contract completion percentage
   */
  calculateCompletionPercentage(contract: Contract): number {
    const now = new Date();
    const startDate = contract.startDate instanceof Date ? contract.startDate : new Date(contract.startDate);
    const endDate = contract.endDate instanceof Date ? contract.endDate : new Date(contract.endDate);

    if (now < startDate) return 0;
    if (now > endDate) return 100;

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();

    return Math.round((elapsed / totalDuration) * 100);
  }

  /**
   * Get contracts by value range
   */
  getContractsByValueRange(contracts: Contract[]): Record<string, number> {
    const ranges = {
      'Under 100K': 0,
      '100K - 500K': 0,
      '500K - 1M': 0,
      '1M - 5M': 0,
      'Over 5M': 0,
    };

    contracts.forEach(contract => {
      const value = this.calculateContractValue(contract);
      
      if (value < 100000) {
        ranges['Under 100K']++;
      } else if (value < 500000) {
        ranges['100K - 500K']++;
      } else if (value < 1000000) {
        ranges['500K - 1M']++;
      } else if (value < 5000000) {
        ranges['1M - 5M']++;
      } else {
        ranges['Over 5M']++;
      }
    });

    return ranges;
  }

  /**
   * Calculate average contract duration
   */
  calculateAverageContractDuration(contracts: Contract[]): number {
    if (contracts.length === 0) return 0;

    const totalDays = contracts.reduce((sum, contract) => {
      const startDate = contract.startDate instanceof Date ? contract.startDate : new Date(contract.startDate);
      const endDate = contract.endDate instanceof Date ? contract.endDate : new Date(contract.endDate);
      
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      
      return sum + durationDays;
    }, 0);

    return Math.round(totalDays / contracts.length);
  }

  /**
   * Get contracts expiring in the next N days
   */
  getExpiringContracts(contracts: Contract[], daysAhead: number = 30): Contract[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);

    return contracts.filter(contract => {
      if (contract.status !== '啟用中') return false;
      
      const endDate = contract.endDate instanceof Date ? contract.endDate : new Date(contract.endDate);
      return endDate >= now && endDate <= futureDate;
    }).sort((a, b) => {
      const dateA = a.endDate instanceof Date ? a.endDate : new Date(a.endDate);
      const dateB = b.endDate instanceof Date ? b.endDate : new Date(b.endDate);
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * Calculate payment completion rate
   */
  calculatePaymentCompletionRate(contract: Contract): number {
    if (!contract.payments || contract.payments.length === 0) return 0;

    const totalPayments = contract.payments.length;
    const completedPayments = contract.payments.filter(payment => payment.paidDate).length;

    return Math.round((completedPayments / totalPayments) * 100);
  }

  /**
   * Get top clients by contract value
   */
  getTopClientsByValue(contracts: Contract[], limit: number = 5): Array<{ client: string; totalValue: number; contractCount: number }> {
    const clientStats: Record<string, { totalValue: number; contractCount: number }> = {};

    contracts.forEach(contract => {
      const value = this.calculateContractValue(contract);
      
      if (!clientStats[contract.client]) {
        clientStats[contract.client] = { totalValue: 0, contractCount: 0 };
      }
      
      clientStats[contract.client].totalValue += value;
      clientStats[contract.client].contractCount++;
    });

    return Object.entries(clientStats)
      .map(([client, stats]) => ({ client, ...stats }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, limit);
  }

  /**
   * Calculate year-over-year growth
   */
  calculateYearOverYearGrowth(contracts: Contract[]): number {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const currentYearValue = contracts
      .filter(contract => {
        const startDate = contract.startDate instanceof Date ? contract.startDate : new Date(contract.startDate);
        return startDate.getFullYear() === currentYear;
      })
      .reduce((sum, contract) => sum + this.calculateContractValue(contract), 0);

    const previousYearValue = contracts
      .filter(contract => {
        const startDate = contract.startDate instanceof Date ? contract.startDate : new Date(contract.startDate);
        return startDate.getFullYear() === previousYear;
      })
      .reduce((sum, contract) => sum + this.calculateContractValue(contract), 0);

    if (previousYearValue === 0) return currentYearValue > 0 ? 100 : 0;

    return Math.round(((currentYearValue - previousYearValue) / previousYearValue) * 100);
  }
}

// Export singleton instance
export const contractStatsService = new ContractStatsService();