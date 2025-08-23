# Contract Statistics Service

## 概述

`ContractStatsService` 是負責處理合約統計和分析計算的服務類別。它從原本的 dashboard 元件中提取了統計邏輯，實現了關注點分離。

## 主要功能

### 核心統計方法

#### `getContractDashboardStats(): Promise<DashboardStats>`
獲取儀表板所需的完整統計數據，包括：
- 總合約數
- 啟用中合約數
- 已完成合約數
- 總價值（包含變更單）
- 平均價值
- 月收入
- 狀態分佈
- 最近合約

#### `calculateContractValue(contract: Contract): number`
計算合約的實際價值，包括已核准的變更單：
```typescript
const actualValue = contractStatsService.calculateContractValue(contract);
```

### 輔助統計方法

#### `calculateMonthlyRevenue(contracts: Contract[]): number`
計算當月收入，基於付款記錄或合約期間估算。

#### `getStatusDistribution(contracts: Contract[]): Record<string, number>`
獲取合約狀態分佈統計。

#### `getRecentContracts(contracts: Contract[], limit?: number): Contract[]`
獲取最近建立的合約列表。

#### `getTopClientsByValue(contracts: Contract[], limit?: number)`
獲取按合約價值排序的頂級客戶列表。

## 使用範例

### 在元件中使用

```typescript
import { contractService } from '@/services/contracts';

// 在 React 元件中
const [stats, setStats] = useState(null);

useEffect(() => {
  const fetchStats = async () => {
    try {
      const dashboardStats = await contractService.getContractDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('獲取統計數據失敗:', error);
    }
  };
  
  fetchStats();
}, []);
```

### 直接使用統計服務

```typescript
import { contractStatsService } from '@/services/contracts';

// 計算單一合約價值
const contractValue = contractStatsService.calculateContractValue(contract);

// 獲取狀態分佈
const distribution = contractStatsService.getStatusDistribution(contracts);

// 獲取頂級客戶
const topClients = contractStatsService.getTopClientsByValue(contracts, 5);
```

## 從舊版本遷移

### 舊版本 (dashboard.tsx)
```typescript
// 舊的統計計算邏輯
const stats = {
  totalContracts: contracts.length,
  active: contracts.filter(c => c.status === '啟用中').length,
  completed: contracts.filter(c => c.status === '已完成').length,
  totalValue: contracts.reduce((acc, c) => acc + c.totalValue, 0),
};
```

### 新版本 (使用服務)
```typescript
// 新的統計服務
const stats = await contractService.getContractDashboardStats();

// 或直接使用統計服務
const stats = await contractStatsService.getContractDashboardStats();
```

## 優勢

1. **關注點分離**: 統計邏輯從 UI 元件中分離
2. **可重用性**: 統計邏輯可在多個地方使用
3. **可測試性**: 可以獨立測試統計邏輯
4. **維護性**: 統計邏輯集中管理，易於維護
5. **擴展性**: 容易添加新的統計功能

## 測試

服務包含完整的單元測試，涵蓋：
- 合約價值計算（包含變更單）
- 狀態分佈統計
- 最近合約獲取
- 儀表板統計數據
- 錯誤處理

## 依賴

- `ContractRepository`: 用於獲取合約數據
- `Contract` 型別: 合約實體定義
- `DashboardStats` 介面: 統計數據結構定義