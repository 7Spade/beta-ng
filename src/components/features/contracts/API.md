# 合約管理 API 文件

## ContractContext API

### 狀態屬性

| 屬性 | 型別 | 描述 |
|------|------|------|
| `contracts` | `Contract[]` | 所有合約列表 |
| `selectedContract` | `Contract \| null` | 當前選中的合約 |
| `stats` | `ContractStats \| null` | 合約統計資料 |
| `dashboardStats` | `DashboardStats \| null` | 儀表板統計資料 |
| `filters` | `ContractFilters` | 當前篩選條件 |
| `loading` | `boolean` | 載入狀態 |
| `error` | `EnhancedError \| null` | 錯誤資訊 |
| `userMessage` | `string \| null` | 使用者友善的錯誤訊息 |
| `lastUpdated` | `Date \| null` | 最後更新時間 |

### 計算屬性

| 屬性 | 型別 | 描述 |
|------|------|------|
| `hasContracts` | `boolean` | 是否有合約資料 |
| `hasError` | `boolean` | 是否有錯誤 |
| `activeContracts` | `Contract[]` | 啟用中的合約 |
| `completedContracts` | `Contract[]` | 已完成的合約 |
| `filteredContracts` | `Contract[]` | 篩選後的合約 |

### 合約操作方法

#### `createContract(data: CreateContractDto): Promise<Contract>`
建立新合約

**參數:**
- `data`: 合約建立資料

**回傳:** 建立的合約物件

**範例:**
```typescript
const newContract = await createContract({
  name: "新合約",
  contractor: "承包商名稱",
  client: "客戶名稱",
  startDate: new Date(),
  endDate: new Date(),
  totalValue: 1000000,
  status: "啟用中",
  scope: "合約範圍描述"
});
```

#### `updateContract(id: string, updates: UpdateContractDto): Promise<Contract>`
更新合約資訊

**參數:**
- `id`: 合約 ID
- `updates`: 要更新的欄位

**回傳:** 更新後的合約物件

#### `deleteContract(id: string): Promise<void>`
刪除合約

**參數:**
- `id`: 合約 ID

#### `updateContractStatus(id: string, status: ContractStatus): Promise<Contract>`
更新合約狀態

**參數:**
- `id`: 合約 ID
- `status`: 新狀態 (`"啟用中" | "已完成" | "暫停中" | "已終止"`)

### 資料操作方法

#### `loadContracts(filters?: ContractFilters): Promise<void>`
載入合約列表

**參數:**
- `filters` (可選): 篩選條件

#### `loadContract(id: string): Promise<Contract | null>`
載入單一合約

**參數:**
- `id`: 合約 ID

**回傳:** 合約物件或 null

#### `refreshContracts(): Promise<void>`
重新整理合約列表

#### `loadStats(): Promise<void>`
載入合約統計資料

#### `loadDashboardStats(): Promise<void>`
載入儀表板統計資料

### 篩選和選擇方法

#### `selectContract(contract: Contract | null): void`
選擇合約

**參數:**
- `contract`: 要選擇的合約或 null

#### `setFilters(filters: ContractFilters): void`
設定篩選條件

**參數:**
- `filters`: 篩選條件物件

#### `clearFilters(): void`
清除所有篩選條件

### 匯出方法

#### `exportContracts(contracts: Contract[], options: ExportOptions): Promise<void>`
匯出合約資料

**參數:**
- `contracts`: 要匯出的合約列表
- `options`: 匯出選項

**範例:**
```typescript
await exportContracts(contracts, {
  format: 'csv',
  filename: 'contracts_export.csv',
  includePayments: false,
  includeChangeOrders: false
});
```

### 工具方法

#### `findContract(id: string): Contract | undefined`
根據 ID 尋找合約

#### `getContractsByStatus(status: ContractStatus): Contract[]`
根據狀態取得合約列表

#### `clearError(): void`
清除錯誤狀態

#### `reset(): void`
重設所有狀態

## 型別定義

### Contract
```typescript
interface Contract extends BaseEntity {
  customId?: string;
  name: string;
  contractor: string;
  client: string;
  clientRepresentative?: string;
  startDate: Date;
  endDate: Date;
  totalValue: number;
  status: ContractStatus;
  scope: string;
  payments: Payment[];
  changeOrders: ChangeOrder[];
  versions: ContractVersion[];
}
```

### ContractFilters
```typescript
interface ContractFilters {
  status?: ContractStatus;
  client?: string;
  contractor?: string;
  startDate?: Date;
  endDate?: Date;
  minValue?: number;
  maxValue?: number;
}
```

### CreateContractDto
```typescript
interface CreateContractDto {
  customId?: string;
  name: string;
  contractor: string;
  client: string;
  clientRepresentative?: string;
  startDate: Date;
  endDate: Date;
  totalValue: number;
  status: ContractStatus;
  scope: string;
  payments?: Payment[];
  changeOrders?: ChangeOrder[];
}
```

### UpdateContractDto
```typescript
interface UpdateContractDto {
  name?: string;
  contractor?: string;
  client?: string;
  clientRepresentative?: string;
  startDate?: Date;
  endDate?: Date;
  totalValue?: number;
  status?: ContractStatus;
  scope?: string;
}
```

### DashboardStats
```typescript
interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  totalValue: number;
  averageValue: number;
  monthlyGrowth: number;
  statusDistribution: Record<ContractStatus, number>;
}
```

### ExportOptions
```typescript
interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filename?: string;
  includePayments?: boolean;
  includeChangeOrders?: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}
```

## 錯誤處理

所有方法都會自動處理錯誤並更新 Context 狀態。錯誤資訊包括：

- `error`: 詳細的錯誤物件
- `userMessage`: 使用者友善的錯誤訊息

錯誤會自動記錄到系統日誌中。

## 快取機制

- 合約資料快取 5 分鐘
- 統計資料快取 2 分鐘
- 使用 `refresh` 方法可以強制重新載入資料

## 使用範例

### 完整的合約管理元件
```typescript
import React from 'react';
import { useContractContext } from '@/context/contracts';

function ContractManager() {
  const {
    contracts,
    loading,
    error,
    createContract,
    updateContract,
    deleteContract,
    loadContracts,
    clearError
  } = useContractContext();

  React.useEffect(() => {
    loadContracts();
  }, []);

  const handleCreate = async (data) => {
    try {
      await createContract(data);
      // 合約會自動添加到列表中
    } catch (error) {
      console.error('建立失敗:', error);
    }
  };

  if (loading) return <div>載入中...</div>;
  
  if (error) {
    return (
      <div>
        <p>錯誤: {error.message}</p>
        <button onClick={clearError}>關閉</button>
      </div>
    );
  }

  return (
    <div>
      <h1>合約管理</h1>
      {contracts.map(contract => (
        <div key={contract.id}>
          <h3>{contract.name}</h3>
          <p>客戶: {contract.client}</p>
          <p>狀態: {contract.status}</p>
          <p>價值: {contract.totalValue.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```