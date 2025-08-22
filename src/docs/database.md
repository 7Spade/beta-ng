
# Constructo - 資料庫設計

本文件詳細說明了 Constructo 平台在 Google Firestore 中的資料庫結構。Firestore 是一個 NoSQL、基於文件的資料庫。

## 1. 資料模型概述

我們使用集合 (Collections) 和文件 (Documents) 來組織數據。頂層集合代表了應用的主要實體。

## 2. 集合 (Collections)

### 2.1. `projects`

此集合儲存所有營造專案的資訊。

- **文件 ID**: 自動生成的唯一 ID (`string`)
- **文件結構**:

| 欄位                   | 類型                                | 描述                                       |
|------------------------|-------------------------------------|--------------------------------------------|
| `customId`             | `string`                            | (可選) 自訂的專案編號。                    |
| `title`                | `string`                            | 專案的標題或名稱。                         |
| `description`          | `string`                            | 專案的詳細描述。                           |
| `client`               | `string`                            | (可選) 客戶名稱。                          |
| `clientRepresentative` | `string`                            | (可選) 客戶代表名稱。                      |
| `value`                | `number`                            | 專案的總合約價值。                         |
| `startDate`            | `Timestamp`                         | 專案的開始日期。                           |
| `endDate`              | `Timestamp`                         | 專案的預計結束日期。                       |
| `tasks`                | `Array<Map>` (Task 物件陣列)        | 專案下的任務列表，支持無限層級的子任務。   |

#### 巢狀 `Task` 物件結構

| 欄位          | 類型                                | 描述                                       |
|---------------|-------------------------------------|--------------------------------------------|
| `id`          | `string`                            | 任務的唯一 ID (客戶端生成)。               |
| `title`       | `string`                            | 任務的標題。                               |
| `status`      | `string` ('待處理', '進行中', '已完成') | 任務的當前狀態。                           |
| `lastUpdated` | `string` (ISO 8601)                 | 任務最後一次更新的時間。                   |
| `quantity`    | `number`                            | 項目數量。                                 |
| `unitPrice`   | `number`                            | 項目單價。                                 |
| `value`       | `number`                            | 任務的價值 (quantity * unitPrice)。        |
| `subTasks`    | `Array<Map>` (Task 物件陣列)        | 巢狀的子任務列表，結構與父任務相同。       |


### 2.2. `contracts`

此集合儲存所有合約的資訊。

- **文件 ID**: 自動生成的唯一 ID (`string`)
- **文件結構**:

| 欄位                   | 類型                | 描述                                       |
|------------------------|---------------------|--------------------------------------------|
| `customId`             | `string`            | (可選) 自訂的合約編號。                    |
| `name`                 | `string`            | 合約的名稱。                               |
| `contractor`           | `string`            | 承包商的名稱。                             |
| `client`               | `string`            | 客戶的名稱。                               |
| `clientRepresentative` | `string`            | (可選) 客戶代表名稱。                      |
| `totalValue`           | `number`            | 合約的總價值。                             |
| `status`               | `string` ('啟用中', '已完成', '暫停中', '已終止') | 合約的當前狀態。                           |
| `scope`                | `string`            | 合約的工作範疇描述。                       |
| `startDate`            | `Timestamp`         | 合約的開始日期。                           |
| `endDate`              | `Timestamp`         | 合約的結束日期。                           |
| `payments`             | `Array<Map>`        | 付款記錄陣列 (目前為空，未來可擴充)。      |
| `changeOrders`         | `Array<Map>`        | 變更單記錄陣列 (目前為空，未來可擴充)。    |
| `versions`             | `Array<Map>`        | 合約版本歷史記錄。                         |

### 2.3. `partners`

此集合儲存所有合作夥伴（如供應商、下游包商）的資訊。

- **文件 ID**: 自動生成的唯一 ID (`string`)
- **文件結構**:

| 欄位                  | 類型                                | 描述                                       |
|-----------------------|-------------------------------------|--------------------------------------------|
| `name`                | `string`                            | 合作夥伴的公司名稱。                       |
| `logoUrl`             | `string`                            | 合作夥伴 Logo 的 URL。                     |
| `category`            | `string` ('技術', '供應商', etc.) | 合作夥伴的類別。                           |
| `status`              | `string` ('啟用中', '停用中', '待審核') | 合作夥伴的狀態。                           |
| `overview`            | `string`                            | 公司業務的簡短概覽。                       |
| `website`             | `string`                            | 官方網站 URL。                             |
| `joinDate`            | `string` (ISO 8601)                 | 成為合作夥伴的日期。                       |
| `flowType`            | `string` ('未配置', '純收款', '純付款', '收付款') | 廠商的財務流程類型。 |
| `receivableWorkflow`  | `Array<string>`                     | 客製化的應收款狀態流程步驟。 |
| `payableWorkflow`     | `Array<string>`                     | 客製化的應付款狀態流程步驟。 |
| `contacts`            | `Array<Map>`                        | 聯絡人列表 (未來可擴充)。                 |
| `transactions`        | `Array<Map>`                        | 交易記錄 (未來可擴充)。                   |
| `performanceReviews`  | `Array<Map>`                        | 績效評估記錄 (未來可擴充)。               |
| `complianceDocuments` | `Array<Map>`                        | 合規文件記錄 (未來可擴充)。               |
| `contracts`           | `Array<Map>`                        | 相關合約記錄 (未來可擴充)。               |

### 2.4. `financial_documents`

此集合儲存所有應收與應付單據。

- **文件 ID**: 自動生成的唯一 ID (`string`)
- **文件結構**:

| 欄位           | 類型                | 描述                                       |
|----------------|---------------------|--------------------------------------------|
| `partnerId`    | `string`            | 關聯到的 `partners` 集合的文件 ID。        |
| `partnerName`  | `string`            | 關聯夥伴的名稱，用於顯示。                 |
| `contractId`   | `string`            | (可選) 關聯到的 `contracts` 集合的文件 ID。|
| `contractName` | `string`            | (可選) 關聯合約的名稱，用於顯示。          |
| `type`         | `string` ('receivable', 'payable') | 單據類型：應收或應付。|
| `amount`       | `number`            | 單據金額。                                 |
| `description`  | `string`            | 單據的簡短描述或備註。                     |
| `currentStep`  | `string`            | 單據在對應夥伴工作流程中的目前步驟。       |
| `createDate`   | `Timestamp`         | 單據的建立日期。                           |
| `dueDate`      | `Timestamp`         | 單據的到期或付款日期。                     |
| `history`      | `Array<Map>`        | 記錄流程中每一步變更的歷史。               |


### 2.5. `teamMembers`

此集合儲存內部團隊成員的資訊。

- **文件 ID**: 自動生成的唯一 ID (`string`)
- **文件結構**:

| 欄位        | 類型            | 描述                       |
|-------------|-----------------|----------------------------|
| `name`      | `string`        | 成員姓名。                 |
| `role`      | `string`        | 成員在團隊中的職位。       |
| `email`     | `string`        | 成員的電子郵件地址。       |
| `phone`     | `string`        | 成員的聯絡電話。           |
| `avatarUrl` | `string`        | (可選) 成員頭像的 URL。    |
| `skillIds`  | `Array<string>` | (可選) 成員擁有的技能 ID 列表。 |

### 2.6. `skills`

此集合儲存所有可用於團隊成員的技能。

- **文件 ID**: 自動生成的唯一 ID (`string`)
- **文件結構**:

| 欄位          | 類型     | 描述               |
|---------------|----------|--------------------|
| `name`        | `string` | 技能的名稱。       |
| `description` | `string` | (可選) 技能的詳細描述。 |

### 2.7. `knowledgeBaseEntries`

此集合儲存所有工法工序庫的條目。

- **文件 ID**: 自動生成的唯一 ID (`string`)
- **文件結構**:

| 欄位        | 類型        | 描述                               |
|-------------|-------------|------------------------------------|
| `title`     | `string`    | 工法或程序的標題。                 |
| `category`  | `string`    | 條目的分類 (例如：結構工程、水電)。 |
| `content`   | `string`    | 詳細的內容，可支援 Markdown 格式。 |
| `tags`      | `Array<string>` | (可選) 相關的關鍵字標籤。      |
| `createdAt` | `Timestamp` | 條目的建立時間。                   |
| `updatedAt` | `Timestamp` | 條目的最後更新時間。               |

### 2.8. `aiTokenLogs`

此集合儲存所有 Genkit AI 流程的 token 消耗紀錄。

- **文件 ID**: 自動生成的唯一 ID (`string`)
- **文件結構**:

| 欄位        | 類型        | 描述                               |
|-------------|-------------|------------------------------------|
| `flowName`  | `string`    | 被呼叫的 Genkit 流程名稱。         |
| `totalTokens` | `number`    | 該次操作消耗的總 token 數量。     |
| `status`    | `string` ('succeeded', 'failed') | 操作的最終狀態。|
| `timestamp` | `Timestamp` | 紀錄的建立時間。                   |
| `userId`    | `string`    | (可選) 執行此操作的使用者 ID。     |
| `error`     | `string`    | (可選) 如果狀態為 'failed'，記錄錯誤訊息。|


## 3. 數據完整性

- 目前，數據完整性主要由客戶端應用程式的邏輯（例如，表單驗證）來保證。
- 未來的版本可以通過部署 Firestore 安全規則來在後端強制實施數據驗證和訪問控制，從而提高安全性。例如，可以規定 `value` 欄位必須是數字，`status` 欄位必須是預定義的幾個字符串之一。
