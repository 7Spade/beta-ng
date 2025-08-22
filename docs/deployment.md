# Constructo - 部署指南

本文件提供了部署 Constructo 平台的說明和要求。

## 1. 部署平台

我們建議使用 [**Firebase App Hosting**](https://firebase.google.com/docs/app-hosting) 來部署此 Next.js 應用程式。App Hosting 提供了全託管、可擴展且安全的環境，並與 Firebase 生態系統的其他部分（如 Firestore）緊密整合。

## 2. 環境要求

- **Node.js**: `v20.x` 或更高版本。
- **Package Manager**: 建議使用 `npm` 或 `pnpm`。

## 3. 環境變數

在部署之前，您需要在您的託管環境中設定一些環境變數。

- **Firebase 配置**:
  您的專案中已經包含了 Firebase 的客戶端配置文件 (`src/lib/firebase.ts`)。通常情況下，App Hosting 會自動處理這些配置。但如果您選擇其他託管平台，請確保以下變數可用：
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`

- **Genkit (Google AI) 配置**:
  為了讓 Genkit 能夠成功調用 Google AI (Gemini) 模型，您需要提供一個 API 金鑰。
  - `GEMINI_API_KEY`: 您的 Google AI Studio API 金鑰。

請將這些變數添加到您的部署平台的環境變數設定中。不要將它們硬編碼到原始碼中。

## 4. 構建與部署步驟

### 使用 Firebase CLI (推薦)

1.  **安裝 Firebase CLI**:
    如果您尚未安裝，請執行以下命令：
    ```bash
    npm install -g firebase-tools
    ```

2.  **登入 Firebase**:
    ```bash
    firebase login
    ```

3.  **初始化 Firebase**:
    在您的專案根目錄下，如果尚未初始化，請執行：
    ```bash
    firebase init hosting
    ```
    當被問到時，選擇 "App Hosting" 並按照提示將其連接到您的 Firebase 專案。

4.  **部署**:
    執行以下命令來構建和部署您的應用程式：
    ```bash
    firebase deploy --only hosting
    ```
    Firebase CLI 會處理構建 Next.js 應用程式並將其部署到 App Hosting 的所有步驟。

### 手動部署

如果您選擇部署到其他平台（如 Vercel, Netlify, 或您自己的伺服器），請遵循以下通用步驟：

1.  **安裝依賴**:
    ```bash
    npm install
    ```

2.  **構建應用程式**:
    ```bash
    npm run build
    ```
    此命令會在 `.next` 目錄中生成一個優化過的生產版本。

3.  **運行應用程式**:
    ```bash
    npm run start
    ```
    這將在生產模式下啟動 Next.js 伺服器。您需要確保您的託管環境能夠執行此命令並將流量代理到指定的端口。

## 5. `apphosting.yaml`

此文件 (`/apphosting.yaml`) 是 Firebase App Hosting 的配置文件。

```yaml
# https://firebase.google.com/docs/app-hosting/configure
runConfig:
  # 如果您希望在高流量時自動增加實例數量，可以增加此值。
  maxInstances: 1
```

您可以根據您的性能和成本需求調整 `maxInstances` 的值。

## 6. Firestore 安全規則

為了保護您的數據，部署到生產環境後，強烈建議您配置 Firestore 安全規則。默認情況下，資料庫是開放的。

**示例規則 (僅允許登入用戶讀寫)**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 拒絕所有對 'workflows' 和 'partners' 集合的寫入操作
    match /{collection}/{doc=**} {
       allow read: if request.auth != null;
       allow write: if false; // 預設拒絕寫入
    }

    // 允許登入用戶讀寫 'projects' 和 'contracts'
    match /(projects|contracts)/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

您可以在 Firebase 控制台的 Firestore Database -> Rules 標籤頁中部署這些規則。