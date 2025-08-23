# Utils 目錄

此目錄包含專案中可重複使用的工具函數和輔助方法。

## 目錄結構

- **`formatting/`**: 資料格式化相關工具函數
- **`transformation/`**: 資料轉換和處理工具函數
- **`validation/`**: 資料驗證工具函數
- **`index.ts`**: 主要工具函數匯出檔案

## 使用方式

```typescript
import { formatCurrency, formatDate } from '@/utils/formatting';
import { transformData, mapToEntity } from '@/utils/transformation';
import { validateEmail, validateRequired } from '@/utils/validation';
```

## 設計原則

- 函數應該是純函數（無副作用）
- 提供完整的 TypeScript 型別支援
- 包含適當的錯誤處理
- 保持函數的單一職責原則
- 提供清晰的函數命名和參數說明
