# Beta Next.js 專案

這是一個基於 Next.js App Router 的現代化企業管理系統，採用 TypeScript、Tailwind CSS 和 Google Genkit AI 框架構建，並遵循清晰的分層架構設計。

## 專案結構

- **`src/`** - 主要源代碼目錄
  - **`app/`** - Next.js App Router 頁面、路由和 Server Actions。
  - **`components/`** - 可重用的 React 元件庫，分為 `features`, `layout`, `ui`。
  - **`config/`** - 應用程式級別的配置文件，如導航菜單。
  - **`context/`** - 全局 React Context 狀態管理。
  - **`docs/`** - 專案的架構、資料庫等設計文檔。
  - **`hooks/`** - 自定義 React Hooks，按業務、數據和 UI 邏輯劃分。
  - **`lib/`** - 核心庫與工具函數，如 Firebase 初始化、類型定義。
  - **`repositories/`** - 數據訪問層 (Repository Pattern)，封裝與 Firestore 的資料交互。
  - **`services/`** - 業務邏輯服務層，處理複雜的業務操作。
  - **`types/`** - 全局 TypeScript 類型定義，按 `entities`, `dto`, `services` 劃分。
  - **`utils/`** - 通用的輔助工具函數，如格式化、驗證等。
  - **`ai/`** - Genkit AI 相關功能和流程定義。
- **`public/`** - 靜態資源目錄。

## 技術棧

- **框架**: Next.js 14+ (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS & shadcn/ui
- **資料庫**: Firebase Firestore
- **AI 功能**: Google Genkit (Gemini)
- **狀態管理**: React Context + Hooks
- **架構模式**: 分層架構 (UI -> Services -> Repositories)

## 架構特點

### 關注點分離 (Separation of Concerns)
本專案採用嚴格的分層架構，實現了完整的關注點分離：

- **展示層 (Presentation Layer)**: React 元件只負責 UI 渲染和使用者互動
- **業務邏輯層 (Business Layer)**: 服務類別處理所有業務規則和計算
- **資料存取層 (Data Access Layer)**: Repository 模式封裝所有資料庫操作
- **狀態管理層**: Context API 和自訂 Hooks 管理應用程式狀態

### 已重構功能
- **✅ 合約管理**: 完整重構，採用新的分層架構
  - 純 UI 元件，無直接資料庫操作
  - 統一的錯誤處理和狀態管理
  - 效能最佳化和快取機制
  - 完整的型別安全和測試覆蓋

### 重構效益
- **可維護性**: 清晰的職責分離，易於理解和修改
- **可測試性**: 每層都可以獨立測試和模擬
- **可重用性**: 服務和 Hooks 可以在多個元件間重用
- **效能**: 智慧快取和記憶化減少不必要的重新渲染
- **型別安全**: 完整的 TypeScript 型別定義
