# Context 目錄

此目錄存放應用程式中所有的 React Context Provider，用於全局狀態管理。

## 檔案

- **`ProjectContext.tsx`** - 專案相關的 Context，管理專案數據和操作
- **`app.context.tsx`** - 應用程式核心 Context，提供全局狀態
- **`error.context.tsx`** - 錯誤處理 Context，管理錯誤狀態

## 用途

- 在元件樹中進行全局狀態管理
- 避免在多層元件之間手動傳遞 props
- 提供跨組件的數據共享
- 管理應用程式的核心狀態
