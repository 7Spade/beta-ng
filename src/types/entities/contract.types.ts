/**
 * Contract entity types
 * Migrated from lib/types.ts for separation of concerns
 */

import { BaseEntity } from './shared.types';

export type ContractStatus = "啟用中" | "已完成" | "暫停中" | "已終止";

export interface Payment {
  id: string;
  amount: number;
  status: "已付款" | "待處理" | "已逾期";
  requestDate: Date;
  paidDate?: Date;
}

export interface ChangeOrder {
  id: string;
  title: string;
  description: string;
  status: "已核准" | "待處理" | "已拒絕";
  date: Date;
  impact: {
    cost: number;
    scheduleDays: number;
  };
}

export interface ContractVersion {
  version: number;
  date: Date;
  changeSummary: string;
}

export interface Contract extends BaseEntity {
  customId?: string;
  name: string;
  contractor: string;
  client: string;
  clientRepresentative?: string;
  startDate: Date;
  endDate: Date;
  totalValue: number;
  status: ContractStatus;
  scope: string;
  payments: Payment[];
  changeOrders: ChangeOrder[];
  versions: ContractVersion[];
}

// Statistics and aggregation types
export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  totalValue: number;
  averageValue: number;
  statusDistribution: Record<ContractStatus, number>;
}

// Query and filter types
export interface ContractFilters {
  status?: ContractStatus;
  client?: string;
  contractor?: string;
  startDate?: Date;
  endDate?: Date;
  minValue?: number;
  maxValue?: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}