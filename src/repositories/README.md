# Repositories 目錄

此目錄包含數據訪問層，負責與 Firebase 數據庫的交互。

## 目錄結構

- **`base/`** - 基礎倉儲類
  - **`base.repository.ts`** - 基礎倉儲抽象類
  - **`firebase.repository.ts`** - Firebase 倉儲實現
- **`contracts/`** - 合約相關的倉儲
  - **`contract.repository.ts`** - 合約數據操作
  - **`contract.repository.interface.ts`** - 合約倉儲接口
  - **`contract.types.ts`** - 合約相關類型
- **`partners/`** - 合作夥伴相關的倉儲
- **`projects/`** - 專案相關的倉儲

## 用途

- 封裝數據庫操作邏輯
- 提供統一的數據訪問接口
- 實現數據持久化
- 支援數據轉換和驗證


