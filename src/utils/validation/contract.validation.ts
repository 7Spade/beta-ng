/**
 * Contract Validation Utilities
 * Provides validation functions for contract-related data
 */

import { Contract, ContractStatus, Payment, ChangeOrder } from '../../types/entities/contract.types';
import { CreateContractDto, UpdateContractDto } from '../../types/dto/contract.dto';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate contract name
 */
export function validateContractName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!name || name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: '合約名稱為必填項目',
      code: 'REQUIRED_FIELD'
    });
  } else if (name.length > 200) {
    errors.push({
      field: 'name',
      message: '合約名稱不能超過200個字元',
      code: 'FIELD_TOO_LONG'
    });
  } else if (name.length < 3) {
    errors.push({
      field: 'name',
      message: '合約名稱至少需要3個字元',
      code: 'FIELD_TOO_SHORT'
    });
  }

  return errors;
}

/**
 * Validate contractor name
 */
export function validateContractor(contractor: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!contractor || contractor.trim().length === 0) {
    errors.push({
      field: 'contractor',
      message: '承包商為必填項目',
      code: 'REQUIRED_FIELD'
    });
  } else if (contractor.length > 100) {
    errors.push({
      field: 'contractor',
      message: '承包商名稱不能超過100個字元',
      code: 'FIELD_TOO_LONG'
    });
  }

  return errors;
}

/**
 * Validate client name
 */
export function validateClient(client: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!client || client.trim().length === 0) {
    errors.push({
      field: 'client',
      message: '客戶為必填項目',
      code: 'REQUIRED_FIELD'
    });
  } else if (client.length > 100) {
    errors.push({
      field: 'client',
      message: '客戶名稱不能超過100個字元',
      code: 'FIELD_TOO_LONG'
    });
  }

  return errors;
}

/**
 * Validate contract dates
 */
export function validateContractDates(startDate: Date, endDate: Date): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!startDate) {
    errors.push({
      field: 'startDate',
      message: '開始日期為必填項目',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!endDate) {
    errors.push({
      field: 'endDate',
      message: '結束日期為必填項目',
      code: 'REQUIRED_FIELD'
    });
  }

  if (startDate && endDate) {
    if (startDate >= endDate) {
      errors.push({
        field: 'endDate',
        message: '結束日期必須晚於開始日期',
        code: 'INVALID_DATE_RANGE'
      });
    }

    // Check if start date is too far in the past (more than 10 years)
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    
    if (startDate < tenYearsAgo) {
      errors.push({
        field: 'startDate',
        message: '開始日期不能超過10年前',
        code: 'DATE_TOO_OLD'
      });
    }

    // Check if end date is too far in the future (more than 20 years)
    const twentyYearsFromNow = new Date();
    twentyYearsFromNow.setFullYear(twentyYearsFromNow.getFullYear() + 20);
    
    if (endDate > twentyYearsFromNow) {
      errors.push({
        field: 'endDate',
        message: '結束日期不能超過20年後',
        code: 'DATE_TOO_FUTURE'
      });
    }
  }

  return errors;
}

/**
 * Validate contract value
 */
export function validateContractValue(totalValue: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (totalValue === undefined || totalValue === null) {
    errors.push({
      field: 'totalValue',
      message: '合約總價值為必填項目',
      code: 'REQUIRED_FIELD'
    });
  } else if (totalValue < 0) {
    errors.push({
      field: 'totalValue',
      message: '合約總價值不能為負數',
      code: 'INVALID_VALUE'
    });
  } else if (totalValue > 10000000000) { // 100億
    errors.push({
      field: 'totalValue',
      message: '合約總價值不能超過100億',
      code: 'VALUE_TOO_LARGE'
    });
  }

  return errors;
}

/**
 * Validate contract scope
 */
export function validateContractScope(scope: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!scope || scope.trim().length === 0) {
    errors.push({
      field: 'scope',
      message: '合約範圍為必填項目',
      code: 'REQUIRED_FIELD'
    });
  } else if (scope.length > 2000) {
    errors.push({
      field: 'scope',
      message: '合約範圍不能超過2000個字元',
      code: 'FIELD_TOO_LONG'
    });
  } else if (scope.length < 10) {
    errors.push({
      field: 'scope',
      message: '合約範圍至少需要10個字元',
      code: 'FIELD_TOO_SHORT'
    });
  }

  return errors;
}

/**
 * Validate contract status
 */
export function validateContractStatus(status: ContractStatus): ValidationError[] {
  const errors: ValidationError[] = [];
  const validStatuses: ContractStatus[] = ['啟用中', '已完成', '暫停中', '已終止'];

  if (!status) {
    errors.push({
      field: 'status',
      message: '合約狀態為必填項目',
      code: 'REQUIRED_FIELD'
    });
  } else if (!validStatuses.includes(status)) {
    errors.push({
      field: 'status',
      message: '無效的合約狀態',
      code: 'INVALID_STATUS'
    });
  }

  return errors;
}

/**
 * Validate custom ID
 */
export function validateCustomId(customId?: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (customId) {
    if (customId.length > 50) {
      errors.push({
        field: 'customId',
        message: '自訂編號不能超過50個字元',
        code: 'FIELD_TOO_LONG'
      });
    }

    // Check for valid characters (alphanumeric, dash, underscore)
    const validPattern = /^[a-zA-Z0-9\-_]+$/;
    if (!validPattern.test(customId)) {
      errors.push({
        field: 'customId',
        message: '自訂編號只能包含字母、數字、連字號和底線',
        code: 'INVALID_FORMAT'
      });
    }
  }

  return errors;
}

/**
 * Validate client representative
 */
export function validateClientRepresentative(representative?: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (representative && representative.length > 100) {
    errors.push({
      field: 'clientRepresentative',
      message: '客戶代表名稱不能超過100個字元',
      code: 'FIELD_TOO_LONG'
    });
  }

  return errors;
}

/**
 * Validate payment data
 */
export function validatePayment(payment: Payment): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!payment.id || payment.id.trim().length === 0) {
    errors.push({
      field: 'payment.id',
      message: '付款ID為必填項目',
      code: 'REQUIRED_FIELD'
    });
  }

  if (payment.amount === undefined || payment.amount === null) {
    errors.push({
      field: 'payment.amount',
      message: '付款金額為必填項目',
      code: 'REQUIRED_FIELD'
    });
  } else if (payment.amount <= 0) {
    errors.push({
      field: 'payment.amount',
      message: '付款金額必須大於0',
      code: 'INVALID_VALUE'
    });
  }

  if (!payment.status) {
    errors.push({
      field: 'payment.status',
      message: '付款狀態為必填項目',
      code: 'REQUIRED_FIELD'
    });
  } else if (!['已付款', '待處理', '已逾期'].includes(payment.status)) {
    errors.push({
      field: 'payment.status',
      message: '無效的付款狀態',
      code: 'INVALID_STATUS'
    });
  }

  if (!payment.requestDate) {
    errors.push({
      field: 'payment.requestDate',
      message: '付款申請日期為必填項目',
      code: 'REQUIRED_FIELD'
    });
  }

  // If status is paid, paidDate should be provided
  if (payment.status === '已付款' && !payment.paidDate) {
    errors.push({
      field: 'payment.paidDate',
      message: '已付款狀態需要提供付款日期',
      code: 'REQUIRED_FIELD'
    });
  }

  return errors;
}

/**
 * Validate change order data
 */
export function validateChangeOrder(changeOrder: ChangeOrder): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!changeOrder.id || changeOrder.id.trim().length === 0) {
    errors.push({
      field: 'changeOrder.id',
      message: '變更單ID為必填項目',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!changeOrder.title || changeOrder.title.trim().length === 0) {
    errors.push({
      field: 'changeOrder.title',
      message: '變更單標題為必填項目',
      code: 'REQUIRED_FIELD'
    });
  } else if (changeOrder.title.length > 200) {
    errors.push({
      field: 'changeOrder.title',
      message: '變更單標題不能超過200個字元',
      code: 'FIELD_TOO_LONG'
    });
  }

  if (!changeOrder.description || changeOrder.description.trim().length === 0) {
    errors.push({
      field: 'changeOrder.description',
      message: '變更單描述為必填項目',
      code: 'REQUIRED_FIELD'
    });
  } else if (changeOrder.description.length > 1000) {
    errors.push({
      field: 'changeOrder.description',
      message: '變更單描述不能超過1000個字元',
      code: 'FIELD_TOO_LONG'
    });
  }

  if (!changeOrder.status) {
    errors.push({
      field: 'changeOrder.status',
      message: '變更單狀態為必填項目',
      code: 'REQUIRED_FIELD'
    });
  } else if (!['已核准', '待處理', '已拒絕'].includes(changeOrder.status)) {
    errors.push({
      field: 'changeOrder.status',
      message: '無效的變更單狀態',
      code: 'INVALID_STATUS'
    });
  }

  if (!changeOrder.date) {
    errors.push({
      field: 'changeOrder.date',
      message: '變更單日期為必填項目',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!changeOrder.impact) {
    errors.push({
      field: 'changeOrder.impact',
      message: '變更單影響為必填項目',
      code: 'REQUIRED_FIELD'
    });
  } else {
    if (changeOrder.impact.cost === undefined || changeOrder.impact.cost === null) {
      errors.push({
        field: 'changeOrder.impact.cost',
        message: '變更單成本影響為必填項目',
        code: 'REQUIRED_FIELD'
      });
    }

    if (changeOrder.impact.scheduleDays === undefined || changeOrder.impact.scheduleDays === null) {
      errors.push({
        field: 'changeOrder.impact.scheduleDays',
        message: '變更單時程影響為必填項目',
        code: 'REQUIRED_FIELD'
      });
    } else if (changeOrder.impact.scheduleDays < 0) {
      errors.push({
        field: 'changeOrder.impact.scheduleDays',
        message: '變更單時程影響不能為負數',
        code: 'INVALID_VALUE'
      });
    }
  }

  return errors;
}

/**
 * Validate complete contract data for creation
 */
export function validateCreateContract(contractData: CreateContractDto): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate required fields
  errors.push(...validateContractName(contractData.name));
  errors.push(...validateContractor(contractData.contractor));
  errors.push(...validateClient(contractData.client));
  errors.push(...validateContractDates(contractData.startDate, contractData.endDate));
  errors.push(...validateContractValue(contractData.totalValue));
  errors.push(...validateContractScope(contractData.scope));

  // Validate optional fields
  if (contractData.customId) {
    errors.push(...validateCustomId(contractData.customId));
  }

  if (contractData.clientRepresentative) {
    errors.push(...validateClientRepresentative(contractData.clientRepresentative));
  }

  if (contractData.status) {
    errors.push(...validateContractStatus(contractData.status));
  }

  // Validate payments if provided
  if (contractData.payments) {
    contractData.payments.forEach((payment, index) => {
      const paymentErrors = validatePayment(payment);
      errors.push(...paymentErrors.map(error => ({
        ...error,
        field: `payments[${index}].${error.field.replace('payment.', '')}`
      })));
    });
  }

  // Validate change orders if provided
  if (contractData.changeOrders) {
    contractData.changeOrders.forEach((changeOrder, index) => {
      const changeOrderErrors = validateChangeOrder(changeOrder);
      errors.push(...changeOrderErrors.map(error => ({
        ...error,
        field: `changeOrders[${index}].${error.field.replace('changeOrder.', '')}`
      })));
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate contract data for updates
 */
export function validateUpdateContract(contractData: UpdateContractDto): ValidationResult {
  const errors: ValidationError[] = [];

  // Only validate fields that are provided
  if (contractData.name !== undefined) {
    errors.push(...validateContractName(contractData.name));
  }

  if (contractData.contractor !== undefined) {
    errors.push(...validateContractor(contractData.contractor));
  }

  if (contractData.client !== undefined) {
    errors.push(...validateClient(contractData.client));
  }

  if (contractData.startDate !== undefined && contractData.endDate !== undefined) {
    errors.push(...validateContractDates(contractData.startDate, contractData.endDate));
  }

  if (contractData.totalValue !== undefined) {
    errors.push(...validateContractValue(contractData.totalValue));
  }

  if (contractData.scope !== undefined) {
    errors.push(...validateContractScope(contractData.scope));
  }

  if (contractData.customId !== undefined) {
    errors.push(...validateCustomId(contractData.customId));
  }

  if (contractData.clientRepresentative !== undefined) {
    errors.push(...validateClientRepresentative(contractData.clientRepresentative));
  }

  if (contractData.status !== undefined) {
    errors.push(...validateContractStatus(contractData.status));
  }

  // Validate payments if provided
  if (contractData.payments) {
    contractData.payments.forEach((payment, index) => {
      const paymentErrors = validatePayment(payment);
      errors.push(...paymentErrors.map(error => ({
        ...error,
        field: `payments[${index}].${error.field.replace('payment.', '')}`
      })));
    });
  }

  // Validate change orders if provided
  if (contractData.changeOrders) {
    contractData.changeOrders.forEach((changeOrder, index) => {
      const changeOrderErrors = validateChangeOrder(changeOrder);
      errors.push(...changeOrderErrors.map(error => ({
        ...error,
        field: `changeOrders[${index}].${error.field.replace('changeOrder.', '')}`
      })));
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate status transition
 */
export function validateStatusTransition(currentStatus: ContractStatus, newStatus: ContractStatus): ValidationResult {
  const errors: ValidationError[] = [];

  // Define valid status transitions
  const validTransitions: Record<ContractStatus, ContractStatus[]> = {
    '啟用中': ['已完成', '暫停中', '已終止'],
    '暫停中': ['啟用中', '已終止'],
    '已完成': [], // Completed contracts cannot change status
    '已終止': [], // Terminated contracts cannot change status
  };

  const allowedTransitions = validTransitions[currentStatus];
  
  if (!allowedTransitions.includes(newStatus)) {
    errors.push({
      field: 'status',
      message: `無法從 ${currentStatus} 轉換到 ${newStatus}`,
      code: 'INVALID_STATUS_TRANSITION'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Business rule validation for contracts
 */
export function validateContractBusinessRules(contract: Partial<Contract>): ValidationResult {
  const errors: ValidationError[] = [];

  // Business rule: Contract duration should not exceed 10 years
  if (contract.startDate && contract.endDate) {
    const durationYears = (contract.endDate.getTime() - contract.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (durationYears > 10) {
      errors.push({
        field: 'endDate',
        message: '合約期間不能超過10年',
        code: 'DURATION_TOO_LONG'
      });
    }
  }

  // Business rule: Total payment amount should not exceed contract value by more than 20%
  if (contract.totalValue && contract.payments) {
    const totalPayments = contract.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const maxAllowedPayments = contract.totalValue * 1.2; // 20% buffer
    
    if (totalPayments > maxAllowedPayments) {
      errors.push({
        field: 'payments',
        message: '付款總額不能超過合約價值的120%',
        code: 'PAYMENTS_EXCEED_CONTRACT_VALUE'
      });
    }
  }

  // Business rule: Active contracts should have future end dates
  if (contract.status === '啟用中' && contract.endDate) {
    const now = new Date();
    if (contract.endDate <= now) {
      errors.push({
        field: 'endDate',
        message: '啟用中的合約結束日期應該在未來',
        code: 'ACTIVE_CONTRACT_PAST_END_DATE'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}