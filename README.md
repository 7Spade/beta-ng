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
