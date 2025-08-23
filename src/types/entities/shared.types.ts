/**
 * 基礎實體介面
 * 所有實體都應該繼承此介面
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 通用狀態型別
 */
export type EntityStatus = '啟用中' | '停用中' | '待審核';

/**
 * 通用任務狀態型別
 */
export type TaskStatus = '待處理' | '進行中' | '已完成';

/**
 * 通用分頁參數
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 通用分頁回應
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 通用查詢參數
 */
export interface QueryParams {
  search?: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

/**
 * 通用 API 回應
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 通用錯誤型別
 */
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

/**
 * 驗證錯誤
 */
export interface ValidationError extends AppError {
  code: 'VALIDATION_ERROR';
  field: string;
  value: any;
}

/**
 * 找不到資源錯誤
 */
export interface NotFoundError extends AppError {
  code: 'NOT_FOUND';
  resource: string;
  id: string;
}

/**
 * 通用載入狀態
 */
export interface LoadingState {
  loading: boolean;
  error: Error | null;
}

/**
 * 通用操作結果
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
}