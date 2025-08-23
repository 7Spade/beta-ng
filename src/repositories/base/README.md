# Base Repository 目錄

此目錄包含儲存庫模式的基礎類別和介面定義。

## 主要檔案

- **`base.repository.ts`**: 基礎儲存庫抽象類別
- **`firebase.repository.ts`**: Firebase 特定的儲存庫實作
- **`index.ts`**: 基礎儲存庫匯出檔案

## 用途

- 定義統一的資料存取介面
- 提供共用的儲存庫功能
- 實作 Firebase 整合邏輯

## 設計原則

- 遵循 Repository 模式
- 提供統一的錯誤處理
- 支援快取和效能優化
- 保持與業務邏輯的分離


