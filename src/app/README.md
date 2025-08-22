# 應用程式目錄 (App Directory)

這是您 Next.js 應用程式的核心，遵循 App Router 的慣例。

## 結構

- **`(app)/`**: 這是一個路由群組，包含了需要共享佈局（如側邊欄和頁首）的所有主要應用程式頁面。
  - **`layout.tsx`**: 定義了應用程式核心區域的共享佈局 (App Shell)。
  - **`[folder]/page.tsx`**: 每個子目錄代表一個路由，其 `page.tsx` 是該路由的進入點。例如，`/app/(app)/projects/page.tsx` 對應於 `/projects` 路由。
- **`layout.tsx`**: 這是根佈局，應用於應用程式的所有頁面。它包含了 `<html>` 和 `<body>` 標籤。
- **`page.tsx`**: 這是應用程式的根頁面，通常用於重新導向到一個預設頁面（例如 `/dashboard`）。
- **`globals.css`**: 全局樣式表，包含了 Tailwind CSS 的基礎層、元件層和工具層，以及 shadcn/ui 的主題變數。
