/**
 * Contract Export Service
 * Handles contract data export in various formats (CSV, Excel, PDF)
 */

import { Contract } from '../../types/entities/contract.types';
import { IContractExportService, ExportOptions } from '../../types/services/contract.service.types';

/**
 * Contract Export Service Implementation
 */
export class ContractExportService implements IContractExportService {

  /**
   * Export contracts to CSV format
   */
  async exportContractsToCSV(contracts: Contract[]): Promise<Blob> {
    try {
      const headers = [
        'ID',
        '自訂編號',
        '名稱',
        '承包商',
        '客戶',
        '客戶代表',
        '開始日期',
        '結束日期',
        '總價值',
        '狀態',
        '範圍',
        '付款筆數',
        '變更單筆數',
        '版本',
        '建立日期',
        '更新日期'
      ];

      const rows = contracts.map(contract => [
        contract.id,
        contract.customId || '',
        `"${this.escapeCsvValue(contract.name)}"`,
        `"${this.escapeCsvValue(contract.contractor)}"`,
        `"${this.escapeCsvValue(contract.client)}"`,
        `"${this.escapeCsvValue(contract.clientRepresentative || '')}"`,
        this.formatDateForCsv(contract.startDate),
        this.formatDateForCsv(contract.endDate),
        contract.totalValue,
        contract.status,
        `"${this.escapeCsvValue(contract.scope)}"`,
        contract.payments?.length || 0,
        contract.changeOrders?.length || 0,
        contract.versions?.length || 0,
        this.formatDateForCsv(contract.createdAt),
        this.formatDateForCsv(contract.updatedAt)
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\n');
      
      // Add BOM for proper UTF-8 encoding in Excel
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });

      return blob;
    } catch (error) {
      console.error('Error exporting contracts to CSV:', error);
      throw new Error(`Failed to export contracts to CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export contracts to Excel format (XLSX)
   */
  async exportContractsToExcel(contracts: Contract[]): Promise<Blob> {
    try {
      // For now, we'll use CSV format as a fallback
      // In a real implementation, you would use a library like xlsx or exceljs
      console.warn('Excel export not fully implemented, falling back to CSV');
      
      const csvBlob = await this.exportContractsToCSV(contracts);
      
      // Convert CSV blob to Excel-compatible format
      // This is a simplified implementation
      return new Blob([await csvBlob.arrayBuffer()], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    } catch (error) {
      console.error('Error exporting contracts to Excel:', error);
      throw new Error(`Failed to export contracts to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export contracts to PDF format
   */
  async exportContractsToPDF(contracts: Contract[]): Promise<Blob> {
    try {
      // For now, we'll create a simple HTML-based PDF
      // In a real implementation, you would use a library like jsPDF or puppeteer
      console.warn('PDF export not fully implemented, creating HTML content');
      
      const htmlContent = this.generateContractsPDFContent(contracts);
      
      return new Blob([htmlContent], {
        type: 'application/pdf'
      });
    } catch (error) {
      console.error('Error exporting contracts to PDF:', error);
      throw new Error(`Failed to export contracts to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate export data based on options
   */
  generateExportData(contracts: Contract[], options: ExportOptions): any[] {
    try {
      let filteredContracts = [...contracts];

      // Apply date range filter if specified
      if (options.dateRange) {
        filteredContracts = filteredContracts.filter(contract => {
          const contractStart = new Date(contract.startDate);
          const contractEnd = new Date(contract.endDate);
          const filterStart = new Date(options.dateRange!.startDate);
          const filterEnd = new Date(options.dateRange!.endDate);

          return (contractStart >= filterStart && contractStart <= filterEnd) ||
                 (contractEnd >= filterStart && contractEnd <= filterEnd) ||
                 (contractStart <= filterStart && contractEnd >= filterEnd);
        });
      }

      // Apply additional filters if specified
      if (options.filters) {
        if (options.filters.status) {
          filteredContracts = filteredContracts.filter(c => c.status === options.filters!.status);
        }
        if (options.filters.client) {
          filteredContracts = filteredContracts.filter(c => c.client === options.filters!.client);
        }
        if (options.filters.contractor) {
          filteredContracts = filteredContracts.filter(c => c.contractor === options.filters!.contractor);
        }
        if (options.filters.minValue !== undefined) {
          filteredContracts = filteredContracts.filter(c => c.totalValue >= options.filters!.minValue!);
        }
        if (options.filters.maxValue !== undefined) {
          filteredContracts = filteredContracts.filter(c => c.totalValue <= options.filters!.maxValue!);
        }
      }

      // Generate export data based on what should be included
      return filteredContracts.map(contract => {
        const baseData = {
          id: contract.id,
          customId: contract.customId || '',
          name: contract.name,
          contractor: contract.contractor,
          client: contract.client,
          clientRepresentative: contract.clientRepresentative || '',
          startDate: this.formatDateForExport(contract.startDate),
          endDate: this.formatDateForExport(contract.endDate),
          totalValue: contract.totalValue,
          status: contract.status,
          scope: contract.scope,
          createdAt: this.formatDateForExport(contract.createdAt),
          updatedAt: this.formatDateForExport(contract.updatedAt),
        };

        // Include payments if requested
        if (options.includePayments && contract.payments) {
          (baseData as any).payments = contract.payments.map(payment => ({
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            requestDate: this.formatDateForExport(payment.requestDate),
            paidDate: payment.paidDate ? this.formatDateForExport(payment.paidDate) : '',
          }));
        }

        // Include change orders if requested
        if (options.includeChangeOrders && contract.changeOrders) {
          (baseData as any).changeOrders = contract.changeOrders.map(changeOrder => ({
            id: changeOrder.id,
            title: changeOrder.title,
            description: changeOrder.description,
            status: changeOrder.status,
            date: this.formatDateForExport(changeOrder.date),
            costImpact: changeOrder.impact.cost,
            scheduleDaysImpact: changeOrder.impact.scheduleDays,
          }));
        }

        return baseData;
      });
    } catch (error) {
      console.error('Error generating export data:', error);
      throw new Error(`Failed to generate export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export contracts with detailed information including payments and change orders
   */
  async exportDetailedContractsToCSV(contracts: Contract[]): Promise<Blob> {
    try {
      const headers = [
        'ID',
        '自訂編號',
        '名稱',
        '承包商',
        '客戶',
        '客戶代表',
        '開始日期',
        '結束日期',
        '總價值',
        '狀態',
        '範圍',
        '付款總額',
        '已付款金額',
        '待付款金額',
        '變更單總成本影響',
        '變更單總時程影響',
        '建立日期',
        '更新日期'
      ];

      const rows = contracts.map(contract => {
        const paymentStats = this.calculatePaymentStats(contract);
        const changeOrderStats = this.calculateChangeOrderStats(contract);

        return [
          contract.id,
          contract.customId || '',
          `"${this.escapeCsvValue(contract.name)}"`,
          `"${this.escapeCsvValue(contract.contractor)}"`,
          `"${this.escapeCsvValue(contract.client)}"`,
          `"${this.escapeCsvValue(contract.clientRepresentative || '')}"`,
          this.formatDateForCsv(contract.startDate),
          this.formatDateForCsv(contract.endDate),
          contract.totalValue,
          contract.status,
          `"${this.escapeCsvValue(contract.scope)}"`,
          paymentStats.totalAmount,
          paymentStats.paidAmount,
          paymentStats.pendingAmount,
          changeOrderStats.totalCostImpact,
          changeOrderStats.totalScheduleImpact,
          this.formatDateForCsv(contract.createdAt),
          this.formatDateForCsv(contract.updatedAt)
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      
      // Add BOM for proper UTF-8 encoding in Excel
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });

      return blob;
    } catch (error) {
      console.error('Error exporting detailed contracts to CSV:', error);
      throw new Error(`Failed to export detailed contracts to CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate payment statistics for a contract
   */
  private calculatePaymentStats(contract: Contract): {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  } {
    if (!contract.payments || contract.payments.length === 0) {
      return { totalAmount: 0, paidAmount: 0, pendingAmount: 0 };
    }

    const totalAmount = contract.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const paidAmount = contract.payments
      .filter(payment => payment.status === '已付款')
      .reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    return { totalAmount, paidAmount, pendingAmount };
  }

  /**
   * Calculate change order statistics for a contract
   */
  private calculateChangeOrderStats(contract: Contract): {
    totalCostImpact: number;
    totalScheduleImpact: number;
  } {
    if (!contract.changeOrders || contract.changeOrders.length === 0) {
      return { totalCostImpact: 0, totalScheduleImpact: 0 };
    }

    const approvedChangeOrders = contract.changeOrders.filter(co => co.status === '已核准');
    
    const totalCostImpact = approvedChangeOrders.reduce((sum, co) => sum + co.impact.cost, 0);
    const totalScheduleImpact = approvedChangeOrders.reduce((sum, co) => sum + co.impact.scheduleDays, 0);

    return { totalCostImpact, totalScheduleImpact };
  }

  /**
   * Escape CSV values to handle quotes and commas
   */
  private escapeCsvValue(value: string): string {
    if (typeof value !== 'string') return String(value);
    return value.replace(/"/g, '""');
  }

  /**
   * Format date for CSV export
   */
  private formatDateForCsv(date: Date): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  /**
   * Format date for general export
   */
  private formatDateForExport(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('zh-TW');
  }

  /**
   * Generate HTML content for PDF export
   */
  private generateContractsPDFContent(contracts: Contract[]): string {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>合約報告</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>合約報告</h1>
          <p>生成日期: ${new Date().toLocaleDateString('zh-TW')}</p>
        </div>
        
        <div class="summary">
          <h2>摘要</h2>
          <p>總合約數: ${contracts.length}</p>
          <p>總價值: $${contracts.reduce((sum, c) => sum + c.totalValue, 0).toLocaleString()}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>合約名稱</th>
              <th>承包商</th>
              <th>客戶</th>
              <th>開始日期</th>
              <th>結束日期</th>
              <th>總價值</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            ${contracts.map(contract => `
              <tr>
                <td>${contract.name}</td>
                <td>${contract.contractor}</td>
                <td>${contract.client}</td>
                <td>${this.formatDateForExport(contract.startDate)}</td>
                <td>${this.formatDateForExport(contract.endDate)}</td>
                <td>$${contract.totalValue.toLocaleString()}</td>
                <td>${contract.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    return htmlContent;
  }
}

// Export singleton instance
export const contractExportService = new ContractExportService();