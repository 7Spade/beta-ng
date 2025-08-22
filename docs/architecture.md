# Constructo - 系統架構

本文檔概述了 Constructo 平台的技術架構、組件和數據流。

## 1. 技術棧

- **框架**: [Next.js](https://nextjs.org/) (使用 App Router)
- **語言**: [TypeScript](https://www.typescriptlang.org/)
- **UI**:
    - [React](https://react.dev/)
    - [ShadCN/UI](https://ui.shadcn.com/): UI 元件庫
    - [Tailwind CSS](https://tailwindcss.com/): CSS 框架
    - [Lucide React](https://lucide.dev/): 圖標庫
- **後端與資料庫**:
    - [Firebase](https://firebase.google.com/):
        - **Firestore**: 作為主要的 NoSQL 資料庫，用於儲存專案、合約、合作夥伴等核心業務數據。
        - **Firebase Hosting / App Hosting**: 用於部署和託管應用程式。
- **AI 功能**:
    - [Google Genkit](https://firebase.google.com/docs/genkit): 用於開發和協調 AI 流程，例如文件解析、內容生成和摘要。
    - **Google AI (Gemini)**: 作為 Genkit 背後的生成式模型。

## 2. 目錄結構

```
src
├── ai
│   ├── flows/         # Genkit AI 流程定義
│   └── genkit.ts      # Genkit 全局實例配置
├── app
│   ├── (app)/         # 主應用程式佈局和頁面
│   │   ├── layout.tsx
│   │   └── page.tsx   # 各模組的頁面路由
│   ├── layout.tsx     # 根佈局
│   └── page.tsx       # 根頁面
├── components
│   ├── app/           # 專案管理相關元件
│   ├── contracts/     # 合約管理相關元件
│   ├── documents/     # DocuParse 相關元件
│   ├── layout/        # 佈局元件 (側邊欄, 頁首)
│   ├── partnerverse/  # PartnerVerse 相關元件
│   └── ui/            # ShadCN/UI 自動生成的元件
├── config
│   └── navigation.config.ts # 側邊欄導航結構
├── context
│   └── ProjectContext.tsx   # 專案數據的 React Context
├── hooks
│   └── use-toast.ts   # 提示訊息 hook
├── lib
│   ├── firebase.ts    # Firebase 初始化與配置
│   ├── types.ts       # 全局 TypeScript 類型定義
│   └── utils.ts       # 通用工具函數 (例如: cn, formatDate)
└── ...
```

## 3. 架構概述

### 3.1. 前端架構

- **App Router**: 採用 Next.js 最新的 App Router 模型，以實現更佳的伺服器端渲染 (SSR)、靜態站點生成 (SSG) 和基於元件的路由。
- **伺服器元件 (Server Components)**: 預設使用伺服器元件來處理數據獲取和渲染，以減少客戶端 JavaScript 的負載並提升初始頁面加載速度。
- **客戶端元件 (Client Components)**: 僅在需要互動性（例如：事件處理、狀態管理 `useState`, `useEffect`）的元件上使用 `'use client'` 指令。
- **狀態管理**:
    - 對於跨越多個元件的全局狀態（如專案列表），使用 React Context (`ProjectContext`)。
    - 對於表單狀態，使用 `react-hook-form` 配合 `zod` 進行驗證。
    - 對於本地元件狀態，使用 `useState`。

### 3.2. 後端與 AI 架構

- **Firebase Firestore**: 作為應用的主要數據庫，其 schema 設計見 `database.md`。數據的讀取和寫入通過 `firebase` SDK 進行。
- **Genkit Flows**: AI 功能被封裝在 Genkit `flow` 中，這些 flow 在伺服器端執行。
    - **`extractWorkItems`**: 從上傳的文件中提取結構化數據。
    - **`generateSubtasks`**: 為專案任務生成 AI 子任務建議。
    - **`summarizeContract`**: 生成合約文件的摘要。
- **Server Actions**: 客戶端元件通過 Next.js 的 Server Actions 與後端 AI 流程進行通信，例如在 `documents` 頁面，上傳文件後觸發 `extractDataFromDocument` Server Action，該 Action 再去調用 Genkit flow。

## 4. 數據流

1.  **頁面加載**:
    - Next.js 伺服器渲染頁面。對於需要數據的頁面（如 `contracts`），元件在客戶端掛載後，通過 `useEffect` 從 Firestore 獲取數據。
    - 像專案列表這樣的數據，通過 `ProjectContext` 和 `onSnapshot` 監聽 Firestore 的實時更新。
2.  **用戶互動 (例如：新增合約)**:
    - 用戶在客戶端元件 (`CreateContractDialog`) 中填寫表單。
    - 表單提交時，觸發一個事件處理函數（如 `handleAddContract`）。
    - 該函數將表單數據轉換為 Firestore 需要的格式，並使用 `addDoc` 將新數據寫入 Firestore。
    - Firestore 數據更新後，`onSnapshot` 監聽器會自動觸發，更新前端狀態，從而刷新 UI。
3.  **AI 功能互動 (例如：文件解析)**:
    - 用戶在客戶端上傳文件。
    - 文件被轉換為 `dataURI`。
    - 觸發一個 Server Action (`extractDataFromDocument`)，並將 `dataURI` 作為參數傳遞。
    - Server Action 在伺服器端調用對應的 Genkit Flow (`extractWorkItems`)。
    - Genkit Flow 與 Google AI 模型進行交互。
    - AI 模型返回結構化的 JSON 數據。
    - Server Action 將處理後的數據返回給客戶端。
    - 客戶端使用 `useActionState` 更新 UI，將提取的數據顯示在表格中。

## 5. 認證與授權

目前應用程式是公開的。未來的版本可以考慮整合 Firebase Authentication 來實現用戶登入和基於角色的訪問控制（RBAC）。`src/lib/roles.ts` 檔案已經為此奠定了初步基礎。