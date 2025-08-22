# 應用程式目錄 (App Directory)

這是您 Next.js 應用程式的核心，遵循 App Router 的慣例。這個目錄是所有頁面路由、伺服器動作 (Server Actions) 和全局樣式的家。

## 結構

- **[`(app)/`](./(app)/README.md)**: 這是一個路由群組，包含了需要共享佈局（如側邊欄和頁首）的所有主要應用程式頁面。點擊連結以查看該目錄的詳細說明。

- **[`actions/`](./actions/README.md)**: 此目錄存放所有 Next.js 的 Server Actions。這些是在伺服器端執行的非同步函數，用於處理數據變更和與後端服務互動。點擊連結以了解更多。

- **`layout.tsx`**: 這是根佈局，應用於應用程式的所有頁面。它包含了 `<html>` 和 `<body>` 標籤，並引入了全局樣式和字體。

- **`page.tsx`**: 這是應用程式的根頁面 (`/`)，通常用於重新導向到一個預設頁面（例如 `/dashboard`）。

- **`globals.css`**: 全局樣式表，包含了 Tailwind CSS 的基礎層、元件層和工具層，以及 `shadcn/ui` 的主題色彩變數。所有 UI 的配色都在此定義。