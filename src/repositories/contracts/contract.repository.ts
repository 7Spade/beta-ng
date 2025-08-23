/**
 * Contract Repository Implementation
 * Handles all contract-related data access operations with Firebase Firestore
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  getCountFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FirebaseRepository } from '../base/firebase.repository';
import { Contract, ContractStatus, ContractStats, ContractFilters } from '../../types/entities/contract.types';
import { PaginationOptions } from '../../types/entities/shared.types';
import { IContractRepository } from './contract.repository.interface';
import {
  FindContractsByStatusParams,
  FindContractsByDateRangeParams,
  FindContractsByClientParams,
  FindContractsParams,
  ContractQueryResult,
  ContractSubscriptionCallback,
  ContractStatsSubscriptionCallback,
  BatchUpdateItem,
  FirestoreContractData,
} from './contract.types';

/**
 * Contract Repository Implementation
 */
export class ContractRepository extends FirebaseRepository<Contract> implements IContractRepository {
  protected collectionName = 'contracts';

  /**
   * Find contracts by status
   */
  async findByStatus(params: FindContractsByStatusParams): Promise<ContractQueryResult> {
    try {
      const { status, pagination } = params;
      const collectionRef = collection(db, this.collectionName);
      const constraints: QueryConstraint[] = [where('status', '==', status)];

      // Add pagination if provided
      if (pagination) {
        const { sortBy = 'createdAt', sortOrder = 'desc', limit: pageLimit } = pagination;
        constraints.push(orderBy(sortBy, sortOrder));
        if (pageLimit) {
          constraints.push(limit(pageLimit));
        }
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const contracts = querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc as any));
      
      // Get total count for this status
      const countQuery = query(collectionRef, where('status', '==', status));
      const countSnapshot = await getCountFromServer(countQuery);
      const total = countSnapshot.data().count;

      return { contracts, total };
    } catch (error) {
      this.handleError(error, `find contracts by status ${params.status}`);
    }
  }

  /**
   * Find contracts by date range
   */
  async findByDateRange(params: FindContractsByDateRangeParams): Promise<ContractQueryResult> {
    try {
      const { dateRange, pagination } = params;
      const collectionRef = collection(db, this.collectionName);
      
      const startTimestamp = Timestamp.fromDate(dateRange.startDate);
      const endTimestamp = Timestamp.fromDate(dateRange.endDate);
      
      const constraints: QueryConstraint[] = [
        where('startDate', '>=', startTimestamp),
        where('startDate', '<=', endTimestamp),
      ];

      // Add pagination if provided
      if (pagination) {
        const { sortBy = 'startDate', sortOrder = 'desc', limit: pageLimit } = pagination;
        constraints.push(orderBy(sortBy, sortOrder));
        if (pageLimit) {
          constraints.push(limit(pageLimit));
        }
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const contracts = querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc as any));
      
      // Get total count for this date range
      const countQuery = query(
        collectionRef,
        where('startDate', '>=', startTimestamp),
        where('startDate', '<=', endTimestamp)
      );
      const countSnapshot = await getCountFromServer(countQuery);
      const total = countSnapshot.data().count;

      return { contracts, total };
    } catch (error) {
      this.handleError(error, `find contracts by date range`);
    }
  }

  /**
   * Find contracts by client name
   */
  async findByClient(params: FindContractsByClientParams): Promise<ContractQueryResult> {
    try {
      const { clientName, pagination } = params;
      const collectionRef = collection(db, this.collectionName);
      const constraints: QueryConstraint[] = [where('client', '==', clientName)];

      // Add pagination if provided
      if (pagination) {
        const { sortBy = 'createdAt', sortOrder = 'desc', limit: pageLimit } = pagination;
        constraints.push(orderBy(sortBy, sortOrder));
        if (pageLimit) {
          constraints.push(limit(pageLimit));
        }
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const contracts = querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc as any));
      
      // Get total count for this client
      const countQuery = query(collectionRef, where('client', '==', clientName));
      const countSnapshot = await getCountFromServer(countQuery);
      const total = countSnapshot.data().count;

      return { contracts, total };
    } catch (error) {
      this.handleError(error, `find contracts by client ${params.clientName}`);
    }
  }

  /**
   * Find contracts with complex filters
   */
  async findContracts(params: FindContractsParams): Promise<ContractQueryResult> {
    try {
      const { filters, pagination } = params;
      const collectionRef = collection(db, this.collectionName);
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (filters) {
        if (filters.status) {
          constraints.push(where('status', '==', filters.status));
        }
        if (filters.client) {
          constraints.push(where('client', '==', filters.client));
        }
        if (filters.contractor) {
          constraints.push(where('contractor', '==', filters.contractor));
        }
        if (filters.startDate) {
          constraints.push(where('startDate', '>=', Timestamp.fromDate(filters.startDate)));
        }
        if (filters.endDate) {
          constraints.push(where('endDate', '<=', Timestamp.fromDate(filters.endDate)));
        }
        if (filters.minValue) {
          constraints.push(where('totalValue', '>=', filters.minValue));
        }
        if (filters.maxValue) {
          constraints.push(where('totalValue', '<=', filters.maxValue));
        }
      }

      // Add pagination if provided
      if (pagination) {
        const { sortBy = 'createdAt', sortOrder = 'desc', limit: pageLimit } = pagination;
        constraints.push(orderBy(sortBy, sortOrder));
        if (pageLimit) {
          constraints.push(limit(pageLimit));
        }
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const contracts = querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc as any));
      
      // Get total count with same filters (without pagination)
      const countConstraints = constraints.filter(c => 
        !(c as any).type || (c as any).type !== 'orderBy' && (c as any).type !== 'limit'
      );
      const countQuery = query(collectionRef, ...countConstraints);
      const countSnapshot = await getCountFromServer(countQuery);
      const total = countSnapshot.data().count;

      return { contracts, total };
    } catch (error) {
      this.handleError(error, `find contracts with filters`);
    }
  }

  /**
   * Get contract statistics and aggregations
   */
  async getContractStats(): Promise<ContractStats> {
    try {
      const collectionRef = collection(db, this.collectionName);
      
      // Get all contracts for statistics calculation
      const allContractsQuery = query(collectionRef);
      const allContractsSnapshot = await getDocs(allContractsQuery);
      const allContracts = allContractsSnapshot.docs.map(doc => this.mapDocumentToEntity(doc as any));

      // Calculate statistics
      const totalContracts = allContracts.length;
      const activeContracts = allContracts.filter(c => c.status === '啟用中').length;
      const completedContracts = allContracts.filter(c => c.status === '已完成').length;
      const totalValue = allContracts.reduce((sum, contract) => sum + contract.totalValue, 0);
      const averageValue = totalContracts > 0 ? totalValue / totalContracts : 0;

      // Status distribution
      const statusDistribution: Record<ContractStatus, number> = {
        '啟用中': 0,
        '已完成': 0,
        '暫停中': 0,
        '已終止': 0,
      };

      allContracts.forEach(contract => {
        statusDistribution[contract.status]++;
      });

      return {
        totalContracts,
        activeContracts,
        completedContracts,
        totalValue,
        averageValue,
        statusDistribution,
      };
    } catch (error) {
      this.handleError(error, 'get contract statistics');
    }
  }

  /**
   * Subscribe to contract changes with filters
   */
  subscribeToContracts(
    filters?: ContractFilters,
    callback?: ContractSubscriptionCallback
  ): Unsubscribe {
    const collectionRef = collection(db, this.collectionName);
    const constraints: QueryConstraint[] = [];

    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.client) {
        constraints.push(where('client', '==', filters.client));
      }
      if (filters.contractor) {
        constraints.push(where('contractor', '==', filters.contractor));
      }
    }

    // Add default ordering
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collectionRef, ...constraints);
    
    return onSnapshot(q, (snapshot) => {
      const contracts = snapshot.docs.map(doc => this.mapDocumentToEntity(doc as any));
      if (callback) {
        callback(contracts);
      }
    }, (error) => {
      console.error('Contract subscription error:', error);
    });
  }

  /**
   * Subscribe to contract statistics changes
   */
  subscribeToContractStats(callback: ContractStatsSubscriptionCallback): Unsubscribe {
    const collectionRef = collection(db, this.collectionName);
    
    return onSnapshot(collectionRef, async () => {
      try {
        const stats = await this.getContractStats();
        callback(stats);
      } catch (error) {
        console.error('Contract stats subscription error:', error);
      }
    }, (error) => {
      console.error('Contract stats subscription error:', error);
    });
  }

  /**
   * Batch update multiple contracts
   */
  async batchUpdateContracts(updates: BatchUpdateItem[]): Promise<void> {
    try {
      const batchUpdates = updates.map(({ id, data }) => ({ id, data }));
      await this.updateMany(batchUpdates);
    } catch (error) {
      this.handleError(error, 'batch update contracts');
    }
  }

  /**
   * Get contracts by multiple IDs
   */
  async findByIds(ids: string[]): Promise<Contract[]> {
    try {
      if (ids.length === 0) return [];
      
      // Firestore 'in' operator supports up to 10 values
      const chunks = this.chunkArray(ids, 10);
      const allContracts: Contract[] = [];

      for (const chunk of chunks) {
        const collectionRef = collection(db, this.collectionName);
        const q = query(collectionRef, where('__name__', 'in', chunk));
        const querySnapshot = await getDocs(q);
        
        const contracts = querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc as any));
        allContracts.push(...contracts);
      }

      return allContracts;
    } catch (error) {
      this.handleError(error, 'find contracts by IDs');
    }
  }

  /**
   * Search contracts by text (name, client, contractor, scope)
   */
  async searchContracts(searchTerm: string, pagination?: PaginationOptions): Promise<ContractQueryResult> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation that searches by exact matches
      // For production, consider using Algolia or Elasticsearch
      
      const collectionRef = collection(db, this.collectionName);
      const constraints: QueryConstraint[] = [];

      // Add pagination if provided
      if (pagination) {
        const { sortBy = 'createdAt', sortOrder = 'desc', limit: pageLimit } = pagination;
        constraints.push(orderBy(sortBy, sortOrder));
        if (pageLimit) {
          constraints.push(limit(pageLimit));
        }
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      // Filter results in memory (not ideal for large datasets)
      const allContracts = querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc as any));
      const searchTermLower = searchTerm.toLowerCase();
      
      const filteredContracts = allContracts.filter(contract =>
        contract.name.toLowerCase().includes(searchTermLower) ||
        contract.client.toLowerCase().includes(searchTermLower) ||
        contract.contractor.toLowerCase().includes(searchTermLower) ||
        contract.scope.toLowerCase().includes(searchTermLower)
      );

      return { contracts: filteredContracts, total: filteredContracts.length };
    } catch (error) {
      this.handleError(error, `search contracts with term: ${searchTerm}`);
    }
  }

  /**
   * Get active contracts count
   */
  async getActiveContractsCount(): Promise<number> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const q = query(collectionRef, where('status', '==', '啟用中'));
      const countSnapshot = await getCountFromServer(q);
      return countSnapshot.data().count;
    } catch (error) {
      this.handleError(error, 'get active contracts count');
    }
  }

  /**
   * Get contracts expiring soon
   */
  async getExpiringContracts(daysAhead: number): Promise<Contract[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      
      const collectionRef = collection(db, this.collectionName);
      const q = query(
        collectionRef,
        where('status', '==', '啟用中'),
        where('endDate', '<=', Timestamp.fromDate(futureDate)),
        orderBy('endDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc as any));
    } catch (error) {
      this.handleError(error, `get contracts expiring in ${daysAhead} days`);
    }
  }

  /**
   * Get contract value statistics by status
   */
  async getValueStatsByStatus(): Promise<Record<ContractStatus, number>> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const allContractsQuery = query(collectionRef);
      const allContractsSnapshot = await getDocs(allContractsQuery);
      const allContracts = allContractsSnapshot.docs.map(doc => this.mapDocumentToEntity(doc as any));

      const valueStats: Record<ContractStatus, number> = {
        '啟用中': 0,
        '已完成': 0,
        '暫停中': 0,
        '已終止': 0,
      };

      allContracts.forEach(contract => {
        valueStats[contract.status] += contract.totalValue;
      });

      return valueStats;
    } catch (error) {
      this.handleError(error, 'get value statistics by status');
    }
  }

  /**
   * Archive old contracts (soft delete)
   */
  async archiveOldContracts(cutoffDate: Date): Promise<number> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const q = query(
        collectionRef,
        where('endDate', '<', Timestamp.fromDate(cutoffDate)),
        where('status', 'in', ['已完成', '已終止'])
      );
      
      const querySnapshot = await getDocs(q);
      const contractsToArchive = querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: { status: '已終止' as ContractStatus }
      }));

      if (contractsToArchive.length > 0) {
        await this.updateMany(contractsToArchive);
      }

      return contractsToArchive.length;
    } catch (error) {
      this.handleError(error, 'archive old contracts');
    }
  }

  /**
   * Override mapFirestoreToEntity to handle contract-specific data transformation
   */
  protected mapFirestoreToEntity(data: any): Partial<Contract> {
    const baseEntity = super.mapFirestoreToEntity(data);
    
    // Transform nested objects if needed
    const transformedData = {
      ...baseEntity,
      payments: data.payments || [],
      changeOrders: data.changeOrders || [],
      versions: data.versions || [],
    };

    // Transform dates in nested objects
    if (transformedData.payments) {
      transformedData.payments = transformedData.payments.map((payment: any) => ({
        ...payment,
        requestDate: payment.requestDate?.toDate ? payment.requestDate.toDate() : payment.requestDate,
        paidDate: payment.paidDate?.toDate ? payment.paidDate.toDate() : payment.paidDate,
      }));
    }

    if (transformedData.changeOrders) {
      transformedData.changeOrders = transformedData.changeOrders.map((changeOrder: any) => ({
        ...changeOrder,
        date: changeOrder.date?.toDate ? changeOrder.date.toDate() : changeOrder.date,
      }));
    }

    if (transformedData.versions) {
      transformedData.versions = transformedData.versions.map((version: any) => ({
        ...version,
        date: version.date?.toDate ? version.date.toDate() : version.date,
      }));
    }

    return transformedData;
  }

  /**
   * Override mapEntityToFirestore to handle contract-specific data transformation
   */
  protected mapEntityToFirestore(entity: Partial<Contract>): any {
    const firestoreData = super.mapEntityToFirestore(entity);
    
    // Transform nested objects for Firestore
    if (firestoreData.payments) {
      firestoreData.payments = firestoreData.payments.map((payment: any) => ({
        ...payment,
        requestDate: payment.requestDate instanceof Date ? Timestamp.fromDate(payment.requestDate) : payment.requestDate,
        paidDate: payment.paidDate instanceof Date ? Timestamp.fromDate(payment.paidDate) : payment.paidDate,
      }));
    }

    if (firestoreData.changeOrders) {
      firestoreData.changeOrders = firestoreData.changeOrders.map((changeOrder: any) => ({
        ...changeOrder,
        date: changeOrder.date instanceof Date ? Timestamp.fromDate(changeOrder.date) : changeOrder.date,
      }));
    }

    if (firestoreData.versions) {
      firestoreData.versions = firestoreData.versions.map((version: any) => ({
        ...version,
        date: version.date instanceof Date ? Timestamp.fromDate(version.date) : version.date,
      }));
    }

    return firestoreData;
  }

  /**
   * Utility method to chunk arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Export singleton instance
export const contractRepository = new ContractRepository();