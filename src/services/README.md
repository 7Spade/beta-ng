# Services 目錄

此目錄包含業務邏輯服務層，處理複雜的業務操作和數據處理。

## 目錄結構

- **`contracts/`** - 合約相關服務
  - **`contract.service.ts`** - 合約業務邏輯
  - **`contract-export.service.ts`** - 合約導出服務
  - **`contract-stats.service.ts`** - 合約統計服務
- **`partners/`** - 合作夥伴相關服務
- **`projects/`** - 專案相關服務
- **`shared/`** - 共享服務
  - **`error.service.ts`** - 錯誤處理服務
  - **`export.service.ts`** - 通用導出服務
  - **`validation.service.ts`** - 驗證服務
- **`logging.service.ts`** - 日誌記錄服務

## 用途

- 實現複雜的業務邏輯
- 處理數據轉換和驗證
- 提供業務操作接口
- 支援錯誤處理和日誌記錄
