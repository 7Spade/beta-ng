# 佈局元件 (Layout Components)

此目錄是您應用程式中所有與佈局相關的元件的中央儲存庫。它被組織成幾個子目錄，每個子目錄都有其特定的職責。

## 結構概覽

- **`core/`**: 存放構成應用程式核心外殼的基礎元件。
  - `AppShell`: 組合了側邊欄和頁首，形成主要的應用程式框架。
  - `AppProvider`: 包裹了所有全局 Context Providers，如 `ThemeProvider`, `ProjectProvider`。
  - `AppHeader`: 應用的頂部標題欄，包含麵包屑導航和側邊欄觸發器。

- **`navigation/`**: 包含所有與導航相關的元件。
  - `UnifiedSidebar`: 響應式、可折疊的側邊欄。
  - `Breadcrumb`: 根據當前路由自動生成的麵包屑導航。
  - `UserMenu`: 右上角的用戶個人資料下拉選單。

- **`overlays/`**: 用於處理彈出層、對話方塊等覆蓋式 UI。
  - `ModalContainer`: 標準的模態對話方塊。
  - `DrawerContainer`: 從螢幕邊緣滑出的抽屜式面板。
  - `TooltipProvider`: 為應用提供全局的提示框功能。

- **`responsive/`**: 包含用於處理響應式設計的元件。
  - `MobileMenu`: 在行動裝置上顯示的側邊欄選單。
  - `ResponsiveWrapper`: 根據螢幕斷點渲染不同元件的包裝器。

- **`shared/`**: 存放可在應用程式各處重用的通用佈局元件。
  - `PageContainer`: 提供一致頁面內邊距和寬度限制的容器。
  - `PageHeader`: 用於頁面標題和可選操作按鈕的標準化頁首。
  - `EmptyState`: 用於顯示列表或內容為空時的佔位元件。

- **`index.ts`**: 從此目錄中匯出所有可用的佈局元件，方便從單一入口點導入。
