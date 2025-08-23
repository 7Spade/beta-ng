# Layout 目錄

此目錄包含應用程式的佈局相關元件，負責整體頁面結構和導航。

## 目錄結構

- **`core/`** - 核心佈局元件
  - **`app-header.tsx`** - 應用程式頁首
  - **`app-provider.tsx`** - 應用程式提供者
  - **`app-shell.tsx`** - 應用程式外殼
  - **`layout-wrapper.tsx`** - 佈局包裝器
  - **`theme-provider.tsx`** - 主題提供者
- **`navigation/`** - 導航相關元件
  - **`breadcrumb.tsx`** - 麵包屑導航
  - **`navigation-menu.tsx`** - 導航選單
  - **`unified-sidebar.tsx`** - 統一側邊欄
  - **`user-menu.tsx`** - 用戶選單
- **`overlays/`** - 覆蓋層元件
  - **`drawer-container.tsx`** - 抽屜容器
  - **`modal-container.tsx`** - 模態框容器
  - **`popover-container.tsx`** - 彈出框容器
- **`responsive/`** - 響應式元件
  - **`mobile-menu.tsx`** - 移動端選單
  - **`responsive-wrapper.tsx`** - 響應式包裝器
- **`shared/`** - 共享佈局元件
  - **`page-container.tsx`** - 頁面容器
  - **`page-header.tsx`** - 頁面標題

## 用途

- 定義應用程式的整體佈局結構
- 提供一致的導航體驗
- 支援響應式設計
- 管理主題和樣式
