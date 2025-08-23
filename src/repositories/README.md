# Repositories 目錄

此目錄包含資料存取層的實作，負責與後端服務和資料庫的互動。

## 目錄結構

- **`base/`**: 基礎儲存庫類別和介面
- **`contracts/`**: 合約相關資料存取
- **`partners/`**: 合作夥伴相關資料存取
- **`projects/`**: 專案相關資料存取
- **`index.ts`**: 主要儲存庫匯出檔案

## 使用方式

```typescript
import { ContractRepository } from '@/repositories/contracts';
import { PartnerRepository } from '@/repositories/partners';
import { ProjectRepository } from '@/repositories/projects';
```

## 設計原則

- 實作 Repository 模式
- 提供統一的資料存取介面
- 處理資料轉換和錯誤處理
- 支援快取和效能優化
- 保持與業務邏輯的分離


