/**
 * Validation Service Tests
 * Tests for the centralized validation service
 */

import { validationService } from '../validation.service';
import { CreateContractDto, UpdateContractDto } from '../../../types/dto/contract.dto';
import { Contract, ContractStatus } from '../../../types/entities/contract.types';

describe('ValidationService', () => {
  describe('Generic Validation Methods', () => {
    describe('validateRequired', () => {
      it('should pass for valid values', () => {
        const result = validationService.validateRequired('test', 'name', '名稱');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail for null/undefined values', () => {
        const result = validationService.validateRequired(null, 'name', '名稱');
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('REQUIRED_FIELD');
      });

      it('should fail for empty strings', () => {
        const result = validationService.validateRequired('', 'name', '名稱');
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe('名稱為必填項目');
      });
    });

    describe('validateString', () => {
      it('should validate string length constraints', () => {
        const result = validationService.validateString('ab', 'name', '名稱', { minLength: 3, maxLength: 10 });
        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('FIELD_TOO_SHORT');
      });

      it('should pass for valid string', () => {
        const result = validationService.validateString('valid name', 'name', '名稱', { minLength: 3, maxLength: 20 });
        expect(result.isValid).toBe(true);
      });
    });

    describe('validateEmail', () => {
      it('should validate correct email format', () => {
        const result = validationService.validateEmail('test@example.com');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid email format', () => {
        const result = validationService.validateEmail('invalid-email');
        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_EMAIL_FORMAT');
      });
    });

    describe('validateCurrency', () => {
      it('should validate positive currency amounts', () => {
        const result = validationService.validateCurrency(1000.50, 'amount', '金額');
        expect(result.isValid).toBe(true);
      });

      it('should reject negative amounts when not allowed', () => {
        const result = validationService.validateCurrency(-100, 'amount', '金額', { allowNegative: false });
        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('NEGATIVE_VALUE_NOT_ALLOWED');
      });

      it('should reject amounts with too many decimal places', () => {
        const result = validationService.validateCurrency(100.123, 'amount', '金額');
        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('TOO_MANY_DECIMAL_PLACES');
      });
    });

    describe('validateTaiwanId', () => {
      it('should validate correct Taiwan ID format', () => {
        const result = validationService.validateTaiwanId('A123456789');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid Taiwan ID format', () => {
        const result = validationService.validateTaiwanId('invalid-id');
        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_TAIWAN_ID_FORMAT');
      });
    });

    describe('validateBusinessNumber', () => {
      it('should validate correct business number format', () => {
        const result = validationService.validateBusinessNumber('12345675');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid business number format', () => {
        const result = validationService.validateBusinessNumber('1234567');
        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_BUSINESS_NUMBER_FORMAT');
      });
    });
  });

  describe('Contract Validation Methods', () => {
    const futureStartDate = new Date();
    futureStartDate.setDate(futureStartDate.getDate() + 1);
    const futureEndDate = new Date();
    futureEndDate.setFullYear(futureEndDate.getFullYear() + 1);

    const validContractData: CreateContractDto = {
      name: '測試合約',
      contractor: '測試承包商',
      client: '測試客戶',
      startDate: futureStartDate,
      endDate: futureEndDate,
      totalValue: 1000000,
      scope: '這是一個測試合約的範圍描述，包含了所有必要的工作內容和交付物。'
    };

    describe('validateContractForCreation', () => {
      it('should pass for valid contract data', () => {
        const result = validationService.validateContractForCreation(validContractData);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail for missing required fields', () => {
        const invalidData = { ...validContractData, name: '' };
        const result = validationService.validateContractForCreation(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'name')).toBe(true);
      });

      it('should fail for invalid date range', () => {
        const laterDate = new Date();
        laterDate.setDate(laterDate.getDate() + 1);
        const earlierDate = new Date();
        
        const invalidData = {
          ...validContractData,
          startDate: laterDate,
          endDate: earlierDate
        };
        const result = validationService.validateContractForCreation(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.code === 'INVALID_DATE_RANGE')).toBe(true);
      });

      it('should fail for negative contract value', () => {
        const invalidData = { ...validContractData, totalValue: -1000 };
        const result = validationService.validateContractForCreation(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.code === 'INVALID_VALUE')).toBe(true);
      });
    });

    describe('validateContractForUpdate', () => {
      it('should pass for valid partial update data', () => {
        const updateData: UpdateContractDto = {
          name: '更新的合約名稱',
          totalValue: 1200000
        };
        const result = validationService.validateContractForUpdate(updateData);
        expect(result.isValid).toBe(true);
      });

      it('should validate only provided fields', () => {
        const updateData: UpdateContractDto = {
          name: '' // Invalid name
        };
        const result = validationService.validateContractForUpdate(updateData);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'name')).toBe(true);
      });
    });

    describe('validateContractStatusTransition', () => {
      it('should allow valid status transitions', () => {
        const result = validationService.validateContractStatusTransition('啟用中', '已完成');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid status transitions', () => {
        const result = validationService.validateContractStatusTransition('已完成', '啟用中');
        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_STATUS_TRANSITION');
      });
    });

    describe('validateContractBusinessRules', () => {
      it('should pass for contracts within business rules', () => {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6); // Started 6 months ago
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6); // Ends in 6 months
        
        const contract: Partial<Contract> = {
          startDate: startDate,
          endDate: endDate,
          totalValue: 1000000,
          status: '啟用中',
          payments: [
            {
              id: 'payment1',
              amount: 500000, // 50% payment for 50% progress is reasonable
              status: '已付款',
              requestDate: new Date(),
              paidDate: new Date()
            }
          ]
        };
        const result = validationService.validateContractBusinessRules(contract);
        expect(result.isValid).toBe(true);
      });

      it('should fail for contracts exceeding duration limit', () => {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 11); // More than 10 years
        
        const contract: Partial<Contract> = {
          startDate: startDate,
          endDate: endDate,
          totalValue: 1000000,
          status: '啟用中'
        };
        const result = validationService.validateContractBusinessRules(contract);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.code === 'DURATION_TOO_LONG')).toBe(true);
      });

      it('should fail for payments exceeding contract value', () => {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        
        const contract: Partial<Contract> = {
          startDate: startDate,
          endDate: endDate,
          totalValue: 1000000,
          status: '啟用中',
          payments: [
            {
              id: 'payment1',
              amount: 1300000, // Exceeds 120% of contract value
              status: '已付款',
              requestDate: new Date(),
              paidDate: new Date()
            }
          ]
        };
        const result = validationService.validateContractBusinessRules(contract);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.code === 'PAYMENTS_EXCEED_CONTRACT_VALUE')).toBe(true);
      });
    });

    describe('validateContractDataConsistency', () => {
      it('should pass for consistent contract data', () => {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        
        const contract: Partial<Contract> = {
          startDate: startDate,
          endDate: endDate,
          payments: [
            {
              id: 'payment1',
              amount: 500000,
              status: '已付款',
              requestDate: new Date(),
              paidDate: new Date()
            }
          ]
        };
        const result = validationService.validateContractDataConsistency(contract);
        expect(result.isValid).toBe(true);
      });

      it('should fail for duplicate payment IDs', () => {
        const contract: Partial<Contract> = {
          payments: [
            {
              id: 'payment1',
              amount: 500000,
              status: '已付款',
              requestDate: new Date(),
              paidDate: new Date()
            },
            {
              id: 'payment1', // Duplicate ID
              amount: 300000,
              status: '待處理',
              requestDate: new Date()
            }
          ]
        };
        const result = validationService.validateContractDataConsistency(contract);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.code === 'DUPLICATE_PAYMENT_IDS')).toBe(true);
      });
    });

    describe('validateContractForScenario', () => {
      it('should validate creation scenario correctly', () => {
        const contract: Partial<Contract> = {
          startDate: new Date(Date.now() + 86400000), // Tomorrow
          endDate: new Date(Date.now() + 365 * 86400000), // Next year
          totalValue: 1000000,
          status: '啟用中'
        };
        const result = validationService.validateContractForScenario(contract, 'creation');
        expect(result.isValid).toBe(true);
      });

      it('should fail creation scenario for past start date', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1); // Yesterday
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        const contract: Partial<Contract> = {
          startDate: pastDate,
          endDate: futureDate,
          totalValue: 1000000,
          status: '啟用中'
        };
        const result = validationService.validateContractForScenario(contract, 'creation');
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.code === 'START_DATE_IN_PAST')).toBe(true);
      });

      it('should validate completion scenario correctly', () => {
        const contract: Partial<Contract> = {
          status: '已完成',
          payments: [
            {
              id: 'payment1',
              amount: 1000000,
              status: '已付款',
              requestDate: new Date(),
              paidDate: new Date()
            }
          ],
          changeOrders: []
        };
        const result = validationService.validateContractForScenario(contract, 'completion');
        expect(result.isValid).toBe(true);
      });

      it('should fail completion scenario with unpaid payments', () => {
        const contract: Partial<Contract> = {
          status: '已完成',
          payments: [
            {
              id: 'payment1',
              amount: 1000000,
              status: '待處理', // Unpaid
              requestDate: new Date()
            }
          ]
        };
        const result = validationService.validateContractForScenario(contract, 'completion');
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.code === 'UNPAID_PAYMENTS_EXIST')).toBe(true);
      });
    });
  });

  describe('Utility Methods', () => {
    describe('combineResults', () => {
      it('should combine multiple validation results', () => {
        const result1 = { isValid: true, errors: [] };
        const result2 = { isValid: false, errors: [{ field: 'test', message: 'error', code: 'TEST_ERROR' }] };
        
        const combined = validationService.combineResults(result1, result2);
        expect(combined.isValid).toBe(false);
        expect(combined.errors).toHaveLength(1);
      });

      it('should return valid result when all inputs are valid', () => {
        const result1 = { isValid: true, errors: [] };
        const result2 = { isValid: true, errors: [] };
        
        const combined = validationService.combineResults(result1, result2);
        expect(combined.isValid).toBe(true);
        expect(combined.errors).toHaveLength(0);
      });
    });

    describe('validateFields', () => {
      it('should validate multiple fields', () => {
        const validations = [
          () => validationService.validateRequired('test', 'field1', '欄位1'),
          () => validationService.validateRequired('', 'field2', '欄位2')
        ];
        
        const result = validationService.validateFields(validations);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('field2');
      });
    });

    describe('validateArrayItems', () => {
      it('should validate each item in array', () => {
        const items = ['valid', '', 'also valid'];
        const result = validationService.validateArrayItems(
          items,
          (item, index) => validationService.validateRequired(item, 'item', '項目')
        );
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('items[1].item');
      });
    });
  });
});