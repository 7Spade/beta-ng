# App 目錄

此目錄包含 Next.js App Router 的頁面、路由和佈局配置。

## 目錄結構

- **`(app)/`** - 應用程式主要路由組
  - **`analytics/`** - 分析儀表板頁面
  - **`contracts/`** - 合約管理頁面
  - **`dashboard/`** - 主儀表板頁面
  - **`documents/`** - 文檔管理頁面
  - **`partnerverse/`** - 合作夥伴管理頁面
  - **`projects/`** - 專案管理頁面
  - **`settings/`** - 設定頁面
  - **`team/`** - 團隊管理頁面
- **`actions/`** - Server Actions 文件，處理表單提交和數據操作
- **`layout.tsx`** - 根佈局組件
- **`page.tsx`** - 首頁組件
- **`globals.css`** - 全局樣式文件

## 用途

- 定義應用程式的路由結構
- 包含所有頁面組件
- 處理 Server Actions 和 API 路由
- 管理頁面佈局和樣式