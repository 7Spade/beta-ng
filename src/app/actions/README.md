# 伺服器動作 (Server Actions)

此目錄存放所有 Next.js 的 [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)。

## 用途

Server Actions 是一些在伺服器端執行的非同步函數。它們可以從客戶端元件（Client Components）中直接呼叫，是處理表單提交、數據變更以及與後端服務（如資料庫或 AI 流程）互動的主要方式，而無需手動建立 API 端點。

在此專案中，我們使用 Server Actions 來：
- 觸發 Genkit AI 流程（例如：從上傳的文件中提取資料）。
- 將處理後的資料寫入 Firestore 資料庫（例如：從文件中建立專案和合約）。

將這些動作集中管理在此目錄中有助於保持程式碼的組織性和可維護性。
