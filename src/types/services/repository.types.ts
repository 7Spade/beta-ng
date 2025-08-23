import { BaseEntity, PaginationParams, PaginatedResponse, QueryParams } from '../entities/shared.types';

/**
 * 基礎 Repository 介面
 * 所有 Repository 都應該實作此介面
 */
export interface IBaseRepository<T extends BaseEntity, ID = string> {
  /**
   * 根據 ID 查找單一實體
   */
  findById(id: ID): Promise<T | null>;

  /**
   * 查找所有實體
   */
  findAll(): Promise<T[]>;

  /**
   * 根據條件查找實體
   */
  findBy(criteria: Partial<T>): Promise<T[]>;

  /**
   * 分頁查詢實體
   */
  findWithPagination(params: PaginationParams): Promise<PaginatedResponse<T>>;

  /**
   * 複雜查詢
   */
  query(params: QueryParams): Promise<T[]>;

  /**
   * 建立新實體
   */
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * 更新實體
   */
  update(id: ID, updates: Partial<T>): Promise<T>;

  /**
   * 刪除實體
   */
  delete(id: ID): Promise<void>;

  /**
   * 批次建立
   */
  createMany(entities: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T[]>;

  /**
   * 批次更新
   */
  updateMany(updates: Array<{ id: ID; data: Partial<T> }>): Promise<T[]>;

  /**
   * 批次刪除
   */
  deleteMany(ids: ID[]): Promise<void>;

  /**
   * 檢查實體是否存在
   */
  exists(id: ID): Promise<boolean>;

  /**
   * 計算符合條件的實體數量
   */
  count(criteria?: Partial<T>): Promise<number>;
}

/**
 * Firebase Repository 特定介面
 */
export interface IFirebaseRepository<T extends BaseEntity, ID = string> extends IBaseRepository<T, ID> {
  /**
   * 訂閱實體變更
   */
  subscribe(callback: (entities: T[]) => void): () => void;

  /**
   * 訂閱單一實體變更
   */
  subscribeById(id: ID, callback: (entity: T | null) => void): () => void;

  /**
   * 訂閱查詢結果變更
   */
  subscribeToQuery(criteria: Partial<T>, callback: (entities: T[]) => void): () => void;

  /**
   * 批次操作 (Firestore batch)
   */
  batch(): FirebaseBatch<T>;
}

/**
 * Firebase 批次操作介面
 */
export interface FirebaseBatch<T extends BaseEntity> {
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): FirebaseBatch<T>;
  update(id: string, updates: Partial<T>): FirebaseBatch<T>;
  delete(id: string): FirebaseBatch<T>;
  commit(): Promise<void>;
}

/**
 * Repository 配置選項
 */
export interface RepositoryConfig {
  collectionName: string;
  enableCache?: boolean;
  cacheTimeout?: number;
  enableRealtime?: boolean;
}

/**
 * 查詢選項
 */
export interface QueryOptions {
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  limit?: number;
  offset?: number;
  where?: WhereClause[];
}

/**
 * Where 條件
 */
export interface WhereClause {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any';
  value: any;
}

/**
 * Repository 錯誤型別
 */
export type RepositoryError = 
  | 'ENTITY_NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'PERMISSION_DENIED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';