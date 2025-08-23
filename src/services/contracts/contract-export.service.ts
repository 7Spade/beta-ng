/**
 * Contract Export Service
 * Handles contract-specific export functionality
 */

import { Contract, ContractStatus } from '../../types/entities/contract.types';
import { ExportService, ExportColumn, ExportOptions } from '../shared/export.service';

export interface ContractExportOptions extends ExportOptions {
  includePayments?: boolean;
  includeChangeOrders?: boolean;
  statusFilter?: ContractStatus[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export class ContractExportService {
  /**
   * Default columns for contract export
   */
  private static getDefaultColumns(): ExportColumn<Contract>[] {
    return [
      {
        key: 'id',
        header: 'ID'
      },
      {
        key: 'customId',
        header: '自訂編號',
        formatter: (value) => value || ''
      },
      {
        key: 'name',
        header: '名稱'
      },
      {
        key: 'contractor',
        header: '承包商'
      },
      {
        key: 'client',
        header: '客戶'
      },
      {
        key: 'clientRepresentative',
        header: '客戶代表',
        formatter: (value) => value || ''
      },
      {
        key: 'startDate',
        header: '開始日期',
        formatter: (value) => ExportService.formatDateForCSV(value)
      },
      {
        key: 'endDate',
        header: '結束日期',
        formatter: (value) => ExportService.formatDateForCSV(value)
      },
      {
        key: 'totalValue',
        header: '總價值',
        formatter: (value) => ExportService.formatCurrencyForCSV(value)
      },
      {
        key: 'status',
        header: '狀態'
      },
      {
        key: 'scope',
        header: '範圍'
      },
      {
        key: 'createdAt',
        header: '建立日期',
        formatter: (value) => ExportService.formatDateForCSV(value)
      },
      {
        key: 'updatedAt',
        header: '更新日期',
        formatter: (value) => ExportService.formatDateForCSV(value)
      }
    ];
  }

  /**
   * Exports contracts to CSV format
   */
  static exportContractsToCSV(
    contracts: Contract[],
    options: ContractExportOptions = {}
  ): void {
    const {
      filename = 'contracts_export.csv',
      statusFilter,
      dateRange,
      ...exportOptions
    } = options;

    // Filter contracts based on options
    let filteredContracts = [...contracts];

    if (statusFilter && statusFilter.length > 0) {
      filteredContracts = filteredContracts.filter(contract =>
        statusFilter.includes(contract.status)
      );
    }

    if (dateRange) {
      filteredContracts = filteredContracts.filter(contract => {
        const contractStart = new Date(contract.startDate);
        const contractEnd = new Date(contract.endDate);
        return contractStart >= dateRange.startDate && contractEnd <= dateRange.endDate;
      });
    }

    const columns = this.getDefaultColumns();

    ExportService.exportToCSV(filteredContracts, columns, {
      filename,
      ...exportOptions
    });
  }

  /**
   * Exports contracts with payment details
   */
  static exportContractsWithPayments(
    contracts: Contract[],
    options: ContractExportOptions = {}
  ): void {
    const { filename = 'contracts_with_payments_export.csv', ...exportOptions } = options;

    // Flatten contracts with their payments
    const flattenedData: any[] = [];

    contracts.forEach(contract => {
      if (contract.payments && contract.payments.length > 0) {
        contract.payments.forEach(payment => {
          flattenedData.push({
            contractId: contract.id,
            contractName: contract.name,
            contractor: contract.contractor,
            client: contract.client,
            contractValue: contract.totalValue,
            contractStatus: contract.status,
            paymentId: payment.id,
            paymentAmount: payment.amount,
            paymentStatus: payment.status,
            paymentRequestDate: payment.requestDate,
            paymentPaidDate: payment.paidDate || null
          });
        });
      } else {
        // Include contracts without payments
        flattenedData.push({
          contractId: contract.id,
          contractName: contract.name,
          contractor: contract.contractor,
          client: contract.client,
          contractValue: contract.totalValue,
          contractStatus: contract.status,
          paymentId: '',
          paymentAmount: '',
          paymentStatus: '',
          paymentRequestDate: '',
          paymentPaidDate: ''
        });
      }
    });

    const columns: ExportColumn<any>[] = [
      { key: 'contractId', header: '合約ID' },
      { key: 'contractName', header: '合約名稱' },
      { key: 'contractor', header: '承包商' },
      { key: 'client', header: '客戶' },
      { key: 'contractValue', header: '合約價值', formatter: (value) => ExportService.formatCurrencyForCSV(value) },
      { key: 'contractStatus', header: '合約狀態' },
      { key: 'paymentId', header: '付款ID' },
      { key: 'paymentAmount', header: '付款金額', formatter: (value) => value ? ExportService.formatCurrencyForCSV(value) : '' },
      { key: 'paymentStatus', header: '付款狀態' },
      { key: 'paymentRequestDate', header: '付款申請日期', formatter: (value) => ExportService.formatDateForCSV(value) },
      { key: 'paymentPaidDate', header: '付款完成日期', formatter: (value) => ExportService.formatDateForCSV(value) }
    ];

    ExportService.exportToCSV(flattenedData, columns, {
      filename,
      ...exportOptions
    });
  }

  /**
   * Exports contracts with change orders
   */
  static exportContractsWithChangeOrders(
    contracts: Contract[],
    options: ContractExportOptions = {}
  ): void {
    const { filename = 'contracts_with_change_orders_export.csv', ...exportOptions } = options;

    // Flatten contracts with their change orders
    const flattenedData: any[] = [];

    contracts.forEach(contract => {
      if (contract.changeOrders && contract.changeOrders.length > 0) {
        contract.changeOrders.forEach(changeOrder => {
          flattenedData.push({
            contractId: contract.id,
            contractName: contract.name,
            contractor: contract.contractor,
            client: contract.client,
            contractValue: contract.totalValue,
            contractStatus: contract.status,
            changeOrderId: changeOrder.id,
            changeOrderTitle: changeOrder.title,
            changeOrderDescription: changeOrder.description,
            changeOrderStatus: changeOrder.status,
            changeOrderDate: changeOrder.date,
            changeOrderCostImpact: changeOrder.impact.cost,
            changeOrderScheduleImpact: changeOrder.impact.scheduleDays
          });
        });
      } else {
        // Include contracts without change orders
        flattenedData.push({
          contractId: contract.id,
          contractName: contract.name,
          contractor: contract.contractor,
          client: contract.client,
          contractValue: contract.totalValue,
          contractStatus: contract.status,
          changeOrderId: '',
          changeOrderTitle: '',
          changeOrderDescription: '',
          changeOrderStatus: '',
          changeOrderDate: '',
          changeOrderCostImpact: '',
          changeOrderScheduleImpact: ''
        });
      }
    });

    const columns: ExportColumn<any>[] = [
      { key: 'contractId', header: '合約ID' },
      { key: 'contractName', header: '合約名稱' },
      { key: 'contractor', header: '承包商' },
      { key: 'client', header: '客戶' },
      { key: 'contractValue', header: '合約價值', formatter: (value) => ExportService.formatCurrencyForCSV(value) },
      { key: 'contractStatus', header: '合約狀態' },
      { key: 'changeOrderId', header: '變更單ID' },
      { key: 'changeOrderTitle', header: '變更單標題' },
      { key: 'changeOrderDescription', header: '變更單描述' },
      { key: 'changeOrderStatus', header: '變更單狀態' },
      { key: 'changeOrderDate', header: '變更單日期', formatter: (value) => ExportService.formatDateForCSV(value) },
      { key: 'changeOrderCostImpact', header: '成本影響', formatter: (value) => value ? ExportService.formatCurrencyForCSV(value) : '' },
      { key: 'changeOrderScheduleImpact', header: '時程影響(天)', formatter: (value) => value ? value.toString() : '' }
    ];

    ExportService.exportToCSV(flattenedData, columns, {
      filename,
      ...exportOptions
    });
  }

  /**
   * Exports contract summary statistics
   */
  static exportContractSummary(
    contracts: Contract[],
    options: ContractExportOptions = {}
  ): void {
    const { filename = 'contract_summary_export.csv', ...exportOptions } = options;

    // Calculate summary statistics
    const summaryData = contracts.map(contract => ({
      id: contract.id,
      name: contract.name,
      contractor: contract.contractor,
      client: contract.client,
      totalValue: contract.totalValue,
      status: contract.status,
      duration: this.calculateContractDuration(contract),
      totalPayments: contract.payments?.length || 0,
      paidAmount: this.calculatePaidAmount(contract),
      pendingAmount: this.calculatePendingAmount(contract),
      totalChangeOrders: contract.changeOrders?.length || 0,
      changeOrderCostImpact: this.calculateChangeOrderCostImpact(contract),
      completionPercentage: this.calculateCompletionPercentage(contract)
    }));

    const columns: ExportColumn<any>[] = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: '合約名稱' },
      { key: 'contractor', header: '承包商' },
      { key: 'client', header: '客戶' },
      { key: 'totalValue', header: '總價值', formatter: (value) => ExportService.formatCurrencyForCSV(value) },
      { key: 'status', header: '狀態' },
      { key: 'duration', header: '合約期間(天)' },
      { key: 'totalPayments', header: '付款筆數' },
      { key: 'paidAmount', header: '已付金額', formatter: (value) => ExportService.formatCurrencyForCSV(value) },
      { key: 'pendingAmount', header: '待付金額', formatter: (value) => ExportService.formatCurrencyForCSV(value) },
      { key: 'totalChangeOrders', header: '變更單數量' },
      { key: 'changeOrderCostImpact', header: '變更單成本影響', formatter: (value) => ExportService.formatCurrencyForCSV(value) },
      { key: 'completionPercentage', header: '完成百分比', formatter: (value) => `${value}%` }
    ];

    ExportService.exportToCSV(summaryData, columns, {
      filename,
      ...exportOptions
    });
  }

  /**
   * Helper method to calculate contract duration in days
   */
  private static calculateContractDuration(contract: Contract): number {
    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Helper method to calculate total paid amount
   */
  private static calculatePaidAmount(contract: Contract): number {
    if (!contract.payments) return 0;
    return contract.payments
      .filter(payment => payment.status === '已付款')
      .reduce((total, payment) => total + payment.amount, 0);
  }

  /**
   * Helper method to calculate pending payment amount
   */
  private static calculatePendingAmount(contract: Contract): number {
    if (!contract.payments) return 0;
    return contract.payments
      .filter(payment => payment.status !== '已付款')
      .reduce((total, payment) => total + payment.amount, 0);
  }

  /**
   * Helper method to calculate total change order cost impact
   */
  private static calculateChangeOrderCostImpact(contract: Contract): number {
    if (!contract.changeOrders) return 0;
    return contract.changeOrders
      .filter(co => co.status === '已核准')
      .reduce((total, co) => total + co.impact.cost, 0);
  }

  /**
   * Helper method to calculate completion percentage
   */
  private static calculateCompletionPercentage(contract: Contract): number {
    const now = new Date();
    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);

    if (now < start) return 0;
    if (now > end || contract.status === '已完成') return 100;

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return Math.round((elapsed / totalDuration) * 100);
  }
}