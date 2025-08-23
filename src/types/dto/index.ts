/**
 * 基礎 DTO 型別定義
 */

/**
 * 基礎建立 DTO
 */
export interface BaseCreateDto {
  // 建立時不需要 id, createdAt, updatedAt
}

/**
 * 基礎更新 DTO
 */
export interface BaseUpdateDto {
  // 更新時所有欄位都是可選的
}

/**
 * 基礎查詢 DTO
 */
export interface BaseQueryDto {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 基礎回應 DTO
 */
export interface BaseResponseDto<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 分頁回應 DTO
 */
export interface PaginatedResponseDto<T = any> extends BaseResponseDto<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 驗證結果 DTO
 */
export interface ValidationResultDto {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * 檔案上傳 DTO
 */
export interface FileUploadDto {
  file: File;
  path?: string;
  metadata?: Record<string, any>;
}

/**
 * 檔案回應 DTO
 */
export interface FileResponseDto {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

// Re-export specific DTOs
export * from './contract.dto';
export * from './project.dto';