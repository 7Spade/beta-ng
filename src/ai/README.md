# AI 目錄

此目錄是您應用程式中所有與 AI 相關的程式碼的家。它使用 [Google Genkit](https://firebase.google.com/docs/genkit) 來定義和協調 AI 流程。

## 結構

- **`genkit.ts`**: 此檔案用於初始化和配置全局的 Genkit 實例。您可以在這裡設定預設模型和插件。
- **`flows/`**: 此目錄包含所有 Genkit `flow` 的定義。每個 `flow` 封裝了一個特定的 AI 驅動任務，例如：
  - 從文件中提取結構化數據。
  - 根據任務標題生成子任務。
  - 總結合約內容。
- **`dev.ts`**: 這是一個開發用的檔案，用於匯入所有 flows，以便 Genkit 開發伺服器能夠偵測並運行它們。
