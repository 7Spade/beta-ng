/**
 * Contract Data Transfer Objects (DTOs)
 * Defines the structure for data transfer between layers
 */

import { ContractStatus, Payment, ChangeOrder, ContractVersion } from '../entities/contract.types';

// Base DTO interface
export interface BaseDto {
  createdAt?: Date;
  updatedAt?: Date;
}

// Create contract DTO - data required to create a new contract
export interface CreateContractDto extends BaseDto {
  customId?: string;
  name: string;
  contractor: string;
  client: string;
  clientRepresentative?: string;
  startDate: Date;
  endDate: Date;
  totalValue: number;
  scope: string;
  status?: ContractStatus; // Optional, defaults to "啟用中"
  payments?: Payment[];
  changeOrders?: ChangeOrder[];
}

// Update contract DTO - partial data for updating existing contract
export interface UpdateContractDto extends Partial<BaseDto> {
  customId?: string;
  name?: string;
  contractor?: string;
  client?: string;
  clientRepresentative?: string;
  startDate?: Date;
  endDate?: Date;
  totalValue?: number;
  status?: ContractStatus;
  scope?: string;
  payments?: Payment[];
  changeOrders?: ChangeOrder[];
  versions?: ContractVersion[];
}

// Contract query DTO - for filtering and searching contracts
export interface ContractQueryDto {
  status?: ContractStatus;
  client?: string;
  contractor?: string;
  startDate?: Date;
  endDate?: Date;
  minValue?: number;
  maxValue?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'startDate' | 'endDate' | 'totalValue' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Payment DTO
export interface CreatePaymentDto {
  amount: number;
  status: Payment['status'];
  requestDate: Date;
  paidDate?: Date;
}

export interface UpdatePaymentDto extends Partial<CreatePaymentDto> {
  id: string;
}

// Change Order DTO
export interface CreateChangeOrderDto {
  title: string;
  description: string;
  status: ChangeOrder['status'];
  date: Date;
  impact: {
    cost: number;
    scheduleDays: number;
  };
}

export interface UpdateChangeOrderDto extends Partial<CreateChangeOrderDto> {
  id: string;
}

// Bulk operations DTO
export interface BulkUpdateContractDto {
  ids: string[];
  updates: UpdateContractDto;
}

export interface BulkDeleteContractDto {
  ids: string[];
  reason?: string;
}