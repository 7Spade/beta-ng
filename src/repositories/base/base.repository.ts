import { BaseEntity, PaginationParams, PaginatedResponse, QueryParams } from '../../types/entities/shared.types';
import { IBaseRepository, QueryOptions, WhereClause } from '../../types/services/repository.types';

/**
 * 抽象基礎 Repository 類別
 * 提供通用的資料存取方法定義
 */
export abstract class BaseRepository<T extends BaseEntity, ID = string> implements IBaseRepository<T, ID> {
  protected abstract collectionName: string;

  /**
   * 根據 ID 查找單一實體
   */
  abstract findById(id: ID): Promise<T | null>;

  /**
   * 查找所有實體
   */
  abstract findAll(): Promise<T[]>;

  /**
   * 根據條件查找實體
   */
  abstract findBy(criteria: Partial<T>): Promise<T[]>;

  /**
   * 分頁查詢實體
   */
  abstract findWithPagination(params: PaginationParams): Promise<PaginatedResponse<T>>;

  /**
   * 複雜查詢
   */
  abstract query(params: QueryParams): Promise<T[]>;

  /**
   * 建立新實體
   */
  abstract create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * 更新實體
   */
  abstract update(id: ID, updates: Partial<T>): Promise<T>;

  /**
   * 刪除實體
   */
  abstract delete(id: ID): Promise<void>;

  /**
   * 批次建立
   */
  abstract createMany(entities: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T[]>;

  /**
   * 批次更新
   */
  abstract updateMany(updates: Array<{ id: ID; data: Partial<T> }>): Promise<T[]>;

  /**
   * 批次刪除
   */
  abstract deleteMany(ids: ID[]): Promise<void>;

  /**
   * 檢查實體是否存在
   */
  abstract exists(id: ID): Promise<boolean>;

  /**
   * 計算符合條件的實體數量
   */
  abstract count(criteria?: Partial<T>): Promise<number>;

  /**
   * 驗證實體資料
   */
  protected validateEntity(entity: Partial<T>): void {
    // 基礎驗證邏輯，子類別可以覆寫
    if (!entity) {
      throw new Error('Entity cannot be null or undefined');
    }
  }

  /**
   * 處理錯誤
   */
  protected handleError(error: any, operation: string): never {
    console.error(`Repository error in ${operation}:`, error);
    throw new Error(`Failed to ${operation}: ${error.message}`);
  }

  /**
   * 生成時間戳
   */
  protected generateTimestamp(): Date {
    return new Date();
  }

  /**
   * 準備建立資料 (添加時間戳)
   */
  protected prepareCreateData<K>(entity: Omit<K, 'id' | 'createdAt' | 'updatedAt'>): Omit<K, 'id'> {
    const now = this.generateTimestamp();
    return {
      ...entity,
      createdAt: now,
      updatedAt: now,
    } as Omit<K, 'id'>;
  }

  /**
   * 準備更新資料 (更新時間戳)
   */
  protected prepareUpdateData(updates: Partial<T>): Partial<T> {
    return {
      ...updates,
      updatedAt: this.generateTimestamp(),
    };
  }
}