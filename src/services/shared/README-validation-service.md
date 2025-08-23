# Validation Service

## 概述

Validation Service 是一個集中化的驗證服務，提供統一的資料驗證邏輯和錯誤處理機制。它整合了通用驗證工具和合約特定的驗證規則，確保資料的完整性和業務規則的一致性。

## 主要功能

### 1. 通用驗證方法

#### 基礎驗證
- `validateRequired<T>()` - 驗證必填欄位
- `validateString()` - 驗證字串長度和格式
- `validateNumber()` - 驗證數值範圍
- `validateDate()` - 驗證日期格式和範圍
- `validateArray()` - 驗證陣列長度
- `validateEnum()` - 驗證枚舉值

#### 格式驗證
- `validateEmail()` - 驗證電子郵件格式
- `validatePhone()` - 驗證台灣電話號碼格式
- `validateUrl()` - 驗證 URL 格式
- `validateTaiwanId()` - 驗證台灣身分證字號
- `validateBusinessNumber()` - 驗證統一編號

#### 特殊驗證
- `validateCurrency()` - 驗證貨幣金額（支援小數位數限制）
- `validatePercentage()` - 驗證百分比值
- `validateFile()` - 驗證檔案上傳（大小、類型、副檔名）

### 2. 合約特定驗證

#### 基本合約驗證
- `validateContractForCreation()` - 驗證合約建立資料
- `validateContractForUpdate()` - 驗證合約更新資料
- `validateContractStatusTransition()` - 驗證合約狀態轉換

#### 業務規則驗證
- `validateContractBusinessRules()` - 驗證合約業務規則
  - 合約期間不超過10年
  - 付款總額不超過合約價值120%
  - 啟用中合約的結束日期必須在未來
  - 大額合約必須定義付款計劃
  - 變更單成本影響限制

#### 資料一致性驗證
- `validateContractDataConsistency()` - 驗證合約資料一致性
  - 檢查重複的付款ID
  - 檢查重複的變更單ID
  - 驗證付款日期在合約期間內
  - 驗證變更單日期在合約期間內

#### 場景特定驗證
- `validateContractForScenario()` - 針對特定業務場景的驗證
  - `creation` - 合約建立場景
  - `completion` - 合約完成場景
  - `termination` - 合約終止場景
  - `renewal` - 合約續約場景

### 3. 進階驗證功能

#### 組合驗證
- `validateFields()` - 驗證多個欄位
- `validateWithBusinessRules()` - 使用自訂業務規則驗證
- `validateConditional()` - 條件式驗證
- `validateArrayItems()` - 驗證陣列中的每個項目

#### 異步驗證
- `validateAsync()` - 支援異步驗證規則（如資料庫檢查）

#### 自訂驗證
- `validateWithCustomMessages()` - 使用自訂錯誤訊息的驗證

### 4. 工具方法

- `combineResults()` - 合併多個驗證結果
- `convertToErrorTypes()` - 轉換驗證錯誤為系統錯誤類型
- `createValidationError()` - 建立驗證錯誤物件

## 使用方式

### 基本使用

```typescript
import { validationService } from '../services/shared/validation.service';

// 驗證必填欄位
const result = validationService.validateRequired(value, 'fieldName', '欄位顯示名稱');

// 驗證字串
const stringResult = validationService.validateString(
  'test string', 
  'name', 
  '名稱', 
  { minLength: 3, maxLength: 50 }
);

// 驗證電子郵件
const emailResult = validationService.validateEmail('user@example.com');
```

### 合約驗證

```typescript
import { CreateContractDto } from '../types/dto/contract.dto';

const contractData: CreateContractDto = {
  name: '測試合約',
  contractor: '承包商',
  client: '客戶',
  startDate: new Date(),
  endDate: new Date('2025-12-31'),
  totalValue: 1000000,
  scope: '合約範圍描述'
};

// 驗證合約建立資料
const result = validationService.validateContractForCreation(contractData);

if (!result.isValid) {
  console.log('驗證錯誤:', result.errors);
}
```

### 組合驗證

```typescript
// 驗證多個欄位
const result = validationService.validateFields([
  () => validationService.validateRequired(name, 'name', '名稱'),
  () => validationService.validateEmail(email, 'email'),
  () => validationService.validateCurrency(amount, 'amount', '金額')
]);
```

### 業務規則驗證

```typescript
// 自訂業務規則
const businessRules = [
  (data: ContractData) => {
    if (data.totalValue > 10000000 && !data.approvalRequired) {
      return {
        isValid: false,
        errors: [{
          field: 'approvalRequired',
          message: '超過一千萬的合約需要特殊核准',
          code: 'APPROVAL_REQUIRED'
        }]
      };
    }
    return { isValid: true, errors: [] };
  }
];

const result = validationService.validateWithBusinessRules(
  contractData, 
  businessRules,
  { component: 'ContractForm', action: 'create' }
);
```

## 錯誤處理

驗證服務整合了錯誤處理機制，會自動記錄驗證錯誤並提供結構化的錯誤資訊：

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

## 錯誤代碼

### 通用錯誤代碼
- `REQUIRED_FIELD` - 必填欄位為空
- `FIELD_TOO_SHORT` - 欄位長度太短
- `FIELD_TOO_LONG` - 欄位長度太長
- `INVALID_EMAIL_FORMAT` - 無效的電子郵件格式
- `INVALID_PHONE_FORMAT` - 無效的電話號碼格式
- `INVALID_DATE` - 無效的日期
- `VALUE_TOO_SMALL` - 數值太小
- `VALUE_TOO_LARGE` - 數值太大

### 合約特定錯誤代碼
- `INVALID_DATE_RANGE` - 無效的日期範圍
- `DURATION_TOO_LONG` - 合約期間太長
- `PAYMENTS_EXCEED_CONTRACT_VALUE` - 付款總額超過合約價值
- `INVALID_STATUS_TRANSITION` - 無效的狀態轉換
- `DUPLICATE_PAYMENT_IDS` - 重複的付款ID
- `OVERPAYMENT_DETECTED` - 檢測到超額付款

### 台灣特定錯誤代碼
- `INVALID_TAIWAN_ID_FORMAT` - 無效的身分證字號格式
- `INVALID_TAIWAN_ID_CHECKSUM` - 身分證字號檢查碼錯誤
- `INVALID_BUSINESS_NUMBER_FORMAT` - 無效的統一編號格式
- `INVALID_BUSINESS_NUMBER_CHECKSUM` - 統一編號檢查碼錯誤

## 測試

驗證服務包含完整的單元測試，涵蓋所有驗證方法和錯誤情況：

```bash
npm test -- --testPathPatterns="validation.service.test.ts"
```

## 擴展

要添加新的驗證規則：

1. 在 `utils/validation/` 中添加具體的驗證函數
2. 在 `ValidationService` 類別中添加對應的方法
3. 更新 `IValidationService` 介面
4. 添加相應的測試案例

## 最佳實踐

1. **統一使用驗證服務** - 所有驗證邏輯都應該通過驗證服務進行
2. **提供清晰的錯誤訊息** - 使用使用者友善的中文錯誤訊息
3. **記錄驗證錯誤** - 利用內建的錯誤記錄機制
4. **組合驗證** - 使用組合驗證方法處理複雜的驗證邏輯
5. **測試驗證規則** - 為所有自訂驗證規則編寫測試