# Hooks 目錄

此目錄包含自定義的 React Hooks，提供可重用的邏輯和狀態管理。

## 目錄結構

- **`business/`** - 業務邏輯相關的 Hooks
  - **`use-contract-actions.ts`** - 合約操作相關的 Hook
  - **`use-contract-stats.ts`** - 合約統計相關的 Hook
- **`data/`** - 數據相關的 Hooks
  - **`use-contracts.ts`** - 合約數據管理的 Hook
- **`ui/`** - UI 相關的 Hooks
  - **`use-error-handling.ts`** - 錯誤處理 Hook
  - **`use-form-state.ts`** - 表單狀態管理 Hook
  - **`use-table-state.ts`** - 表格狀態管理 Hook
- **`use-mobile.tsx`** - 移動端檢測 Hook
- **`use-toast.ts`** - 提示訊息 Hook

## 用途

- 封裝可重用的邏輯
- 提供統一的狀態管理
- 簡化元件的複雜度
- 支援業務邏輯的復用
