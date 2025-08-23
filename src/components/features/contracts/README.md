# 合約管理功能

此目錄包含重構後的合約管理相關元件，遵循關注點分離原則和分層架構設計。

## 架構概述

合約功能採用分層架構設計：
- **展示層 (Presentation Layer)**: React 元件，純 UI 邏輯
- **業務邏輯層 (Business Layer)**: 服務類別，處理業務規則
- **資料存取層 (Data Access Layer)**: Repository 模式，封裝資料操作
- **狀態管理層**: Context API 和自訂 Hooks

## 目錄結構

### 元件層 (`components/features/contracts/`)
- **`dashboard/`** - 合約儀表板元件
  - **`dashboard.tsx`** - 重構後的純 UI 儀表板元件
- **`details/`** - 合約詳情頁面元件
  - **`contract-changes-tab.tsx`** - 合約變更標籤頁
  - **`contract-details-tab.tsx`** - 合約詳情標籤頁
  - **`contract-history-tab.tsx`** - 合約歷史標籤頁
  - **`contract-payments-tab.tsx`** - 合約付款標籤頁
- **`table/`** - 合約表格元件
  - **`contracts-table.tsx`** - 重構後的純 UI 表格元件
  - **`contracts-row.tsx`** - 合約行元件
  - **`__tests__/`** - 表格元件測試
- **`ai-summarizer-dialog.tsx`** - AI 合約摘要對話框
- **`contracts-details-sheet.tsx`** - 合約詳情側邊面板
- **`create-contract-dialog.tsx`** - 創建合約對話框
- **`dashboard-stats.tsx`** - 儀表板統計展示元件

### 相關架構檔案

#### 服務層 (`services/contracts/`)
- **`contract.service.ts`** - 合約核心業務邏輯
- **`contract-stats.service.ts`** - 合約統計計算服務
- **`contract-export.service.ts`** - 合約匯出服務

#### 資料存取層 (`repositories/contracts/`)
- **`contract.repository.ts`** - 合約資料存取實作
- **`contract.types.ts`** - Repository 專用型別

#### 狀態管理 (`context/contracts/`)
- **`contract.context.tsx`** - 合約全域狀態管理
- **`contract.provider.tsx`** - Context Provider

#### 自訂 Hooks (`hooks/`)
- **`data/use-contracts.ts`** - 合約資料獲取 Hooks
- **`business/use-contract-stats.ts`** - 合約統計 Hooks
- **`business/use-contract-actions.ts`** - 合約操作 Hooks
- **`ui/use-table-state.ts`** - 表格狀態管理 Hooks

#### 型別定義 (`types/`)
- **`entities/contract.types.ts`** - 合約實體型別
- **`dto/contract.dto.ts`** - 合約資料傳輸物件
- **`services/contract.service.types.ts`** - 服務介面型別

## 使用方式

### 1. 基本合約資料獲取
```typescript
import { useContractContext } from '@/context/contracts';

function MyComponent() {
  const { contracts, loading, error } = useContractContext();
  
  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;
  
  return (
    <div>
      {contracts.map(contract => (
        <div key={contract.id}>{contract.name}</div>
      ))}
    </div>
  );
}
```

### 2. 合約操作
```typescript
import { useContractContext } from '@/context/contracts';

function ContractActions() {
  const { createContract, updateContract, deleteContract } = useContractContext();
  
  const handleCreate = async (data) => {
    try {
      await createContract(data);
    } catch (error) {
      console.error('建立失敗:', error);
    }
  };
  
  // ...其他操作
}
```

### 3. 合約統計
```typescript
import { useContractContext } from '@/context/contracts';

function ContractStats() {
  const { dashboardStats, loadDashboardStats } = useContractContext();
  
  useEffect(() => {
    loadDashboardStats();
  }, []);
  
  return (
    <div>
      <p>總合約數: {dashboardStats?.totalContracts}</p>
      <p>啟用中: {dashboardStats?.activeContracts}</p>
      <p>已完成: {dashboardStats?.completedContracts}</p>
    </div>
  );
}
```

## 重構特點

### 1. 關注點分離
- **UI 元件**: 只負責渲染和使用者互動
- **業務邏輯**: 封裝在服務層中
- **資料存取**: 統一在 Repository 層處理
- **狀態管理**: 使用 Context API 集中管理

### 2. 效能最佳化
- **記憶化**: 使用 `useMemo` 和 `useCallback` 避免不必要的重新渲染
- **快取機制**: Repository 和 Hooks 層實作智慧快取
- **懶載入**: 按需載入資料和元件

### 3. 錯誤處理
- **統一錯誤處理**: 所有層級都使用統一的錯誤處理機制
- **使用者友善訊息**: 提供本地化的錯誤訊息
- **錯誤記錄**: 自動記錄錯誤以便除錯

### 4. 型別安全
- **嚴格型別定義**: 所有介面和資料都有完整的 TypeScript 型別
- **DTO 模式**: 使用資料傳輸物件確保 API 契約
- **介面分離**: 不同層級使用專用的介面定義

## 測試策略

- **單元測試**: 每個服務和 Hook 都有對應的單元測試
- **整合測試**: 測試元件與服務的整合
- **模擬測試**: 使用 Mock 隔離測試各層級

## 遷移指南

如果你有舊的合約相關程式碼需要遷移：

1. **元件遷移**: 移除直接的 Firebase 呼叫，使用 `useContractContext`
2. **型別遷移**: 從 `@/lib/types` 改為 `@/types/entities/contract.types`
3. **服務遷移**: 將業務邏輯移至對應的服務類別
4. **測試更新**: 更新測試以使用新的架構

## 效能考量

- 合約資料會自動快取 5 分鐘
- 統計資料會快取 2 分鐘
- 使用 `React.memo` 避免不必要的重新渲染
- 實作虛擬化處理大量合約資料
