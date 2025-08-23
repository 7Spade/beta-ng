/**
 * Contract Provider
 * High-level provider component that combines contract context with error handling
 */

import React, { ReactNode } from 'react';
import { ContractProvider as BaseContractProvider, ContractProviderProps } from './contract.context';
import { ErrorProvider } from '../shared/error.context';
import { ContractFilters } from '../../types/entities/contract.types';

// Extended provider props
export interface ContractProviderWithErrorProps extends Omit<ContractProviderProps, 'children'> {
  children: ReactNode;
  enableErrorHandling?: boolean;
  maxErrors?: number;
  autoRemoveTimeout?: number;
}

/**
 * Contract Provider with integrated error handling
 * This is the main provider that should be used in the application
 */
export function ContractProvider({
  children,
  autoLoad = true,
  initialFilters = {},
  enableErrorHandling = true,
  maxErrors = 10,
  autoRemoveTimeout = 5000,
}: ContractProviderWithErrorProps) {
  if (enableErrorHandling) {
    return (
      <ErrorProvider maxErrors={maxErrors} autoRemoveTimeout={autoRemoveTimeout}>
        <BaseContractProvider autoLoad={autoLoad} initialFilters={initialFilters}>
          {children}
        </BaseContractProvider>
      </ErrorProvider>
    );
  }

  return (
    <BaseContractProvider autoLoad={autoLoad} initialFilters={initialFilters}>
      {children}
    </BaseContractProvider>
  );
}

/**
 * Lightweight Contract Provider without error handling
 * Use this when you want to manage errors separately or when nesting providers
 */
export function ContractProviderLite({
  children,
  autoLoad = true,
  initialFilters = {},
}: ContractProviderProps) {
  return (
    <BaseContractProvider autoLoad={autoLoad} initialFilters={initialFilters}>
      {children}
    </BaseContractProvider>
  );
}

/**
 * Contract Provider with custom filters
 * Convenience provider for specific contract views
 */
export function ContractProviderWithFilters({
  children,
  filters,
  autoLoad = true,
  enableErrorHandling = true,
}: {
  children: ReactNode;
  filters: ContractFilters;
  autoLoad?: boolean;
  enableErrorHandling?: boolean;
}) {
  return (
    <ContractProvider
      autoLoad={autoLoad}
      initialFilters={filters}
      enableErrorHandling={enableErrorHandling}
    >
      {children}
    </ContractProvider>
  );
}

/**
 * Active Contracts Provider
 * Provider pre-configured for active contracts only
 */
export function ActiveContractsProvider({
  children,
  enableErrorHandling = true,
}: {
  children: ReactNode;
  enableErrorHandling?: boolean;
}) {
  return (
    <ContractProviderWithFilters
      filters={{ status: '啟用中' }}
      enableErrorHandling={enableErrorHandling}
    >
      {children}
    </ContractProviderWithFilters>
  );
}

/**
 * Completed Contracts Provider
 * Provider pre-configured for completed contracts only
 */
export function CompletedContractsProvider({
  children,
  enableErrorHandling = true,
}: {
  children: ReactNode;
  enableErrorHandling?: boolean;
}) {
  return (
    <ContractProviderWithFilters
      filters={{ status: '已完成' }}
      enableErrorHandling={enableErrorHandling}
    >
      {children}
    </ContractProviderWithFilters>
  );
}

/**
 * Contract Provider for specific client
 * Provider pre-configured for a specific client's contracts
 */
export function ClientContractsProvider({
  children,
  clientName,
  enableErrorHandling = true,
}: {
  children: ReactNode;
  clientName: string;
  enableErrorHandling?: boolean;
}) {
  return (
    <ContractProviderWithFilters
      filters={{ client: clientName }}
      enableErrorHandling={enableErrorHandling}
    >
      {children}
    </ContractProviderWithFilters>
  );
}

/**
 * Contract Provider for date range
 * Provider pre-configured for contracts within a specific date range
 */
export function DateRangeContractsProvider({
  children,
  startDate,
  endDate,
  enableErrorHandling = true,
}: {
  children: ReactNode;
  startDate: Date;
  endDate: Date;
  enableErrorHandling?: boolean;
}) {
  return (
    <ContractProviderWithFilters
      filters={{ startDate, endDate }}
      enableErrorHandling={enableErrorHandling}
    >
      {children}
    </ContractProviderWithFilters>
  );
}

// Re-export the hook for convenience
export { useContractContext } from './contract.context';

// Re-export types
export type { ContractContextValue } from './contract.context';