# 服務目錄 (Services)

此目錄用於存放可在應用程式後端（例如 Server Actions 或 Genkit Flows）重用的模組化服務。

將這些邏輯提取到獨立的服務中有以下好處：
- **可重用性**: 同一個服務可以被不同的 Server Action 或 AI Flow 呼叫。
- **關注點分離**: 讓您的 Action 和 Flow 專注於處理請求和協調流程，而將具體的業務邏輯（如資料庫操作、日誌記錄）委託給服務。
- **可測試性**: 獨立的服務更容易進行單元測試。

## 目前服務

- **`logging.service.ts`**: 提供一個 `logAiTokenUsage` 函數，用於非同步地將 AI token 的消耗紀錄寫入 Firestore，而不會阻塞主應用流程。
