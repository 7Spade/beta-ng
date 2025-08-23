/**
 * Firebase Data Transformation Utilities
 * Handles conversion between Firestore data types and application entities
 */

import { Timestamp, DocumentData } from 'firebase/firestore';
import { BaseEntity } from '../../types/entities/shared.types';

/**
 * Transform Firestore Timestamp to Date
 */
export function timestampToDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  if (timestamp && timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000);
  }
  
  return null;
}

/**
 * Transform Date to Firestore Timestamp
 */
export function dateToTimestamp(date: Date | null | undefined): Timestamp | null {
  if (!date) return null;
  
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  
  return null;
}

/**
 * Transform Firestore document data to entity
 */
export function transformFirestoreToEntity<T extends BaseEntity>(
  data: DocumentData,
  id: string
): T {
  const transformedData = { ...data };
  
  // Transform all timestamp fields to dates
  Object.keys(transformedData).forEach(key => {
    const value = transformedData[key];
    
    if (value && typeof value.toDate === 'function') {
      transformedData[key] = value.toDate();
    } else if (Array.isArray(value)) {
      // Handle arrays that might contain timestamps
      transformedData[key] = value.map(item => 
        transformNestedTimestamps(item)
      );
    } else if (value && typeof value === 'object' && value.constructor === Object) {
      // Handle nested objects
      transformedData[key] = transformNestedTimestamps(value);
    }
  });
  
  return {
    ...transformedData,
    id,
  } as T;
}

/**
 * Transform entity to Firestore document data
 */
export function transformEntityToFirestore<T extends BaseEntity>(
  entity: Partial<T>
): DocumentData {
  const firestoreData = { ...entity };
  
  // Remove id field as it's handled separately in Firestore
  delete (firestoreData as any).id;
  
  // Transform all Date fields to timestamps
  Object.keys(firestoreData).forEach(key => {
    const value = (firestoreData as any)[key];
    
    if (value instanceof Date) {
      (firestoreData as any)[key] = Timestamp.fromDate(value);
    } else if (Array.isArray(value)) {
      // Handle arrays that might contain dates
      (firestoreData as any)[key] = value.map(item => 
        transformNestedDates(item)
      );
    } else if (value && typeof value === 'object' && value.constructor === Object) {
      // Handle nested objects
      (firestoreData as any)[key] = transformNestedDates(value);
    }
  });
  
  return firestoreData;
}

/**
 * Recursively transform timestamps in nested objects
 */
function transformNestedTimestamps(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformNestedTimestamps(item));
  }
  
  const transformed = { ...obj };
  
  Object.keys(transformed).forEach(key => {
    const value = transformed[key];
    
    if (value && typeof value.toDate === 'function') {
      transformed[key] = value.toDate();
    } else if (Array.isArray(value)) {
      transformed[key] = value.map(item => transformNestedTimestamps(item));
    } else if (value && typeof value === 'object' && value.constructor === Object) {
      transformed[key] = transformNestedTimestamps(value);
    }
  });
  
  return transformed;
}

/**
 * Recursively transform dates in nested objects
 */
function transformNestedDates(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformNestedDates(item));
  }
  
  const transformed = { ...obj };
  
  Object.keys(transformed).forEach(key => {
    const value = transformed[key];
    
    if (value instanceof Date) {
      transformed[key] = Timestamp.fromDate(value);
    } else if (Array.isArray(value)) {
      transformed[key] = value.map(item => transformNestedDates(item));
    } else if (value && typeof value === 'object' && value.constructor === Object) {
      transformed[key] = transformNestedDates(value);
    }
  });
  
  return transformed;
}

/**
 * Validate and clean entity data before saving
 */
export function validateAndCleanEntityData<T extends BaseEntity>(
  entity: Partial<T>
): Partial<T> {
  const cleaned = { ...entity };
  
  // Remove undefined values
  Object.keys(cleaned).forEach(key => {
    if ((cleaned as any)[key] === undefined) {
      delete (cleaned as any)[key];
    }
  });
  
  // Validate required fields for BaseEntity
  if (cleaned.createdAt && !(cleaned.createdAt instanceof Date)) {
    throw new Error('createdAt must be a Date object');
  }
  
  if (cleaned.updatedAt && !(cleaned.updatedAt instanceof Date)) {
    throw new Error('updatedAt must be a Date object');
  }
  
  return cleaned;
}

/**
 * Sanitize string fields to prevent XSS and other issues
 */
export function sanitizeStringFields<T extends Record<string, any>>(
  data: T,
  stringFields: (keyof T)[]
): T {
  const sanitized = { ...data };
  
  stringFields.forEach(field => {
    const value = sanitized[field];
    if (typeof value === 'string') {
      // Basic sanitization - remove potentially dangerous characters
      sanitized[field] = value
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '') as T[keyof T];
    }
  });
  
  return sanitized;
}

/**
 * Transform array of Firestore documents to entities
 */
export function transformFirestoreArrayToEntities<T extends BaseEntity>(
  docs: Array<{ id: string; data: () => DocumentData }>
): T[] {
  return docs.map(doc => 
    transformFirestoreToEntity<T>(doc.data(), doc.id)
  );
}

/**
 * Batch transform entities for Firestore operations
 */
export function batchTransformEntitiesForFirestore<T extends BaseEntity>(
  entities: Array<Partial<T>>
): DocumentData[] {
  return entities.map(entity => transformEntityToFirestore(entity));
}

/**
 * Deep clone object to avoid mutation issues
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const cloned = {} as T;
  Object.keys(obj).forEach(key => {
    (cloned as any)[key] = deepClone((obj as any)[key]);
  });
  
  return cloned;
}

/**
 * Merge entity updates with existing data
 */
export function mergeEntityUpdates<T extends BaseEntity>(
  existing: T,
  updates: Partial<T>
): T {
  const merged = deepClone(existing);
  
  Object.keys(updates).forEach(key => {
    const updateValue = (updates as any)[key];
    if (updateValue !== undefined) {
      (merged as any)[key] = updateValue;
    }
  });
  
  // Always update the updatedAt timestamp
  merged.updatedAt = new Date();
  
  return merged;
}

/**
 * Extract changed fields between two entities
 */
export function extractChangedFields<T extends BaseEntity>(
  original: T,
  updated: T
): Partial<T> {
  const changes: Partial<T> = {};
  
  Object.keys(updated).forEach(key => {
    const originalValue = (original as any)[key];
    const updatedValue = (updated as any)[key];
    
    // Skip id and timestamps for comparison
    if (key === 'id' || key === 'createdAt') {
      return;
    }
    
    // Simple comparison (for complex objects, might need deep comparison)
    if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
      (changes as any)[key] = updatedValue;
    }
  });
  
  return changes;
}