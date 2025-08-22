# Context 目錄

此目錄存放應用程式中所有的 React Context Provider。Context 用於在元件樹中進行全局或半全局的狀態管理，避免了在多層元件之間手動傳遞 props（即 "prop drilling"）。

## 檔案

- **`ProjectContext.tsx`**: 此 Context 專門用於管理專案相關的數據。它負責從 Firestore 獲取專案列表，並提供新增專案、更新任務狀態等操作方法。任何需要存取或操作專案數據的元件都可以使用 `useProjects` hook 來連接到此 Context。
