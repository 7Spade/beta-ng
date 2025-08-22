# Constructo - 功能藍圖 (Feature Roadmap)

本文檔規劃了 Constructo 平台的詳細功能，從核心模組到未來的擴展方向，旨在為開發提供清晰的指引。

## V1.0 - 核心功能 (MVP)

### 1. 核心平台 (Core Platform)
- [x] **現代化 UI/UX**: 基於 ShadCN/UI 和 Tailwind CSS，提供乾淨、數據驅動的界面。
- [x] **響應式設計**: 確保應用在桌面、平板和行動裝置上都有一致且優良的用戶體驗。
- [x] **統一導航**: 提供可折疊的側邊欄，讓用戶可以快速在不同模組間切換。
- [x] **即時數據更新**: 整合 Firebase Firestore，利用 `onSnapshot` 實現關鍵數據的即時更新。
- [x] **提示與通知**: 使用 `shadcn/ui` 的 Toast 元件提供用戶操作的反饋。

### 2. 分析與儀表板 (Analytics & Dashboard)
- [x] **統一儀表板 (`/dashboard`)**: 集中展示來自各核心模組（專案、合約、合作夥伴）的關鍵統計數據卡片。
- [x] **專案分析頁面 (`/analytics`)**:
    - [x] 顯示總專案數、總任務數。
    - [x] 提醒即將到期的專案。
    - [x] 為每個專案提供進度圓餅圖 (`ProjectProgressChart`)，視覺化展示已完成、進行中和待處理任務的價值分佈。

### 3. 專案管理 (Project Management)
- [x] **專案列表 (`/projects`)**: 以卡片形式展示所有專案，包含進度條、總價值和基本資訊。
- [x] **專案詳情頁 (`/projects/[id]`)**:
    - [x] 顯示專案的詳細描述、起訖日期和總價值。
    - [x] 提供可無限層級巢狀的任務列表 (`TaskItem`)。
    - [x] 用戶可以新增、編輯和更新任務狀態。
    - [ ] **(AI)** 為任務提供子任務建議 (`AISubtaskSuggestions`)。
- [x] **建立專案**: 提供一個對話方塊 (`CreateProjectDialog`) 讓用戶可以輕鬆建立新專案。

### 4. 合約管理 (Contract Management)
- [x] **合約儀表板 (`/contracts`)**: 顯示總合約數、啟用中、已完成合約數量及總合約價值。
- [x] **合約列表 (`ContractsTable`)**: 以表格形式展示所有合約，支援排序和篩選。
- [x] **合約詳情 (`ContractDetailsSheet`)**: 以側拉表面板展示合約的完整資訊，包括付款、變更單和歷史版本。
- [x] **(AI)** **合約摘要 (`AiSummarizerDialog`)**: 允許用戶上傳合約文件，利用 AI 生成內容摘要。
- [x] **建立合約**: 提供一個對話方塊 (`CreateContractDialog`) 讓用戶可以新增合約。

### 5. 智能文件解析 (DocuParse)
- [x] **文件上傳 (`/documents`)**: 支援拖拽或點擊上傳文件（PDF, DOCX 等）。
- [x] **(AI)** **數據提取**: 使用 Genkit Flow (`extractWorkItems`) 調用 AI 模型，從文件中自動提取工作項目、數量和價格。
- [x] **可編輯表格**: 將提取的數據顯示在一個可互動的表格 (`WorkItemsTable`) 中，用戶可以手動修改、新增或刪除項目。
- [x] **數據匯出**: 支援將表格中的數據匯出為 CSV 或 JSON 格式。

### 6. 合作夥伴關係管理 (PartnerVerse)
- [x] **合作夥伴儀表板 (`/partnerverse/dashboard`)**: 展示合作夥伴總數、類別分佈圖和近期活動。
- [x] **合作夥伴列表 (`/partnerverse/partners`)**: 以卡片形式展示所有合作夥伴，並提供篩選功能。
- [x] **合作夥伴資料頁 (`PartnerProfile`)**: 提供合作夥伴的完整檔案，包含概覽、聯絡人、交易紀錄、績效評估等多個標籤頁。
- [x] **視覺化工作流程建立器 (`/partnerverse/workflows`)**:
    - [x] 允許用戶拖放節點（開始、結束、任務、決策）來設計工作流程。
    - [x] 建立節點之間的連線。
    - [x] 將工作流程指派給特定合作夥伴。
- [ ] **(AI)** **工作流程優化助理 (`OptimizationAssistant`)**: 根據用戶輸入的歷史數據和現有流程，提供 AI 優化建議。

### 7. 內部團隊管理 (Internal Team Management)
- [x] **同伴列表 (`/team/members`)**: 提供一個頁面框架，用於未來顯示內部團隊成員。
- [x] **排班表 (`/team/schedule`)**: 提供一個頁面框架，用於未來管理團隊的排班。

## V2.0 - 未來規劃 (Future Enhancements)
- **用戶認證與權限 (Authentication & RBAC)**:
    - 整合 Firebase Authentication 實現用戶登入、註冊。
    - 實現基於角色的訪問控制（Admin, Manager, Viewer），不同角色擁有不同操作權限。
- **預算與成本控制**:
    - 更精細的成本追蹤，與專案任務和採購訂單關聯。
    - 預算與實際成本的對比分析。
- **採購管理**:
    - 建立採購訂單 (Purchase Orders)。
    - 追蹤供應商交貨狀態。
- **進階分析與報告**:
    - 提供更多可自訂的圖表和報告。
    - 專案成本、時間和資源的趨勢分析。
- **行動端優化**:
    - 開發專用的 PWA 或原生應用，提供現場人員更好的移動體驗。
- **通知系統**:
    - 對於即將到期的合約、任務或需要審批的事項，發送郵件或應用內通知。
- **第三方整合**:
    - 與會計軟體（如 QuickBooks）或雲端儲存（如 Google Drive）進行整合。
