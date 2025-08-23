# Types 目錄

此目錄包含專案中所有的 TypeScript 型別定義，提供型別安全和開發體驗。

## 目錄結構

- **`entities/`**: 核心業務實體型別定義
- **`dto/`**: 資料傳輸物件型別定義
- **`services/`**: 服務層相關型別定義
- **`index.ts`**: 主要型別匯出檔案

## 使用方式

```typescript
import { User, Project } from '@/types/entities';
import { CreateUserDto } from '@/types/dto';
import { RepositoryInterface } from '@/types/services';
```

## 設計原則

- 使用 TypeScript 嚴格模式
- 避免使用 `any` 型別
- 優先使用介面而非型別別名
- 保持型別定義的簡潔性和可讀性
