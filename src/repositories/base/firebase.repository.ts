import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  Timestamp,
  QueryConstraint,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Unsubscribe,
  getCountFromServer,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BaseRepository } from './base.repository';
import { BaseEntity, PaginationParams, PaginatedResponse, QueryParams } from '../../types/entities/shared.types';
import { IFirebaseRepository, FirebaseBatch } from '../../types/services/repository.types';

/**
 * Firebase Firestore Repository 實作
 * 提供 Firestore 特定的資料存取方法
 */
export abstract class FirebaseRepository<T extends BaseEntity, ID extends string = string> 
  extends BaseRepository<T, ID> 
  implements IFirebaseRepository<T, ID> {

  protected abstract collectionName: string;

  /**
   * 根據 ID 查找單一實體
   */
  async findById(id: ID): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.mapDocumentToEntity(docSnap as QueryDocumentSnapshot<T>);
      }
      
      return null;
    } catch (error) {
      this.handleError(error, `find ${this.collectionName} by id ${id}`);
    }
  }

  /**
   * 查找所有實體
   */
  async findAll(): Promise<T[]> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const q = query(collectionRef as any); // Cast to any to satisfy the type
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc as QueryDocumentSnapshot<T>));
    } catch (error) {
      this.handleError(error, `find all ${this.collectionName}`);
    }
  }

  /**
   * 根據條件查找實體
   */
  async findBy(criteria: Partial<T>): Promise<T[]> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const constraints: QueryConstraint[] = [];

      // 建立查詢條件
      Object.entries(criteria).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          constraints.push(where(key, '==', value));
        }
      });

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc as QueryDocumentSnapshot<T>));
    } catch (error) {
      this.handleError(error, `find ${this.collectionName} by criteria`);
    }
  }

  /**
   * 分頁查詢實體
   */
  async findWithPagination(params: PaginationParams): Promise<PaginatedResponse<T>> {
    try {
      const { page, limit: pageLimit, sortBy = 'createdAt', sortOrder = 'desc' } = params;
      const collectionRef = collection(db, this.collectionName);
      
      // 計算總數
      const countSnapshot = await getCountFromServer(collectionRef);
      const total = countSnapshot.data().count;
      
      // 建立查詢
      const constraints: QueryConstraint[] = [
        orderBy(sortBy, sortOrder),
        limit(pageLimit)
      ];

      // 如果不是第一頁，需要設定起始點
      if (page > 1) {
        const offset = (page - 1) * pageLimit;
        const offsetQuery = query(collectionRef, orderBy(sortBy, sortOrder), limit(offset));
        const offsetSnapshot = await getDocs(offsetQuery);
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        if (lastDoc) {
          constraints.push(startAfter(lastDoc));
        }
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const data = querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc as QueryDocumentSnapshot<T>));
      const totalPages = Math.ceil(total / pageLimit);

      return {
        data,
        total,
        page,
        limit: pageLimit,
        totalPages
      };
    } catch (error) {
      this.handleError(error, `paginate ${this.collectionName}`);
    }
  }

  /**
   * 複雜查詢
   */
  async query(params: QueryParams): Promise<T[]> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const constraints: QueryConstraint[] = [];

      // 處理篩選條件
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            constraints.push(where(key, '==', value));
          }
        });
      }

      // 處理分頁
      if (params.pagination) {
        const { sortBy = 'createdAt', sortOrder = 'desc', limit: pageLimit } = params.pagination;
        constraints.push(orderBy(sortBy, sortOrder));
        if (pageLimit) {
          constraints.push(limit(pageLimit));
        }
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc as QueryDocumentSnapshot<T>));
    } catch (error) {
      this.handleError(error, `query ${this.collectionName}`);
    }
  }

  /**
   * 建立新實體
   */
  async create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      this.validateEntity(entity as Partial<T>);
      
      const collectionRef = collection(db, this.collectionName);
      const preparedData = this.prepareCreateData(entity);
      const firestoreData = this.mapEntityToFirestore(preparedData as Partial<T>);
      
      const docRef = await addDoc(collectionRef, firestoreData);
      
      // 取得建立的文件
      const docSnap = await getDoc(docRef);
      return this.mapDocumentToEntity(docSnap as DocumentSnapshot<T>);
    } catch (error) {
      this.handleError(error, `create ${this.collectionName}`);
    }
  }

  /**
   * 更新實體
   */
  async update(id: ID, updates: Partial<T>): Promise<T> {
    try {
      const docRef = doc(db, this.collectionName, id);
      
      // 檢查文件是否存在
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`${this.collectionName} with id ${id} not found`);
      }

      const preparedUpdates = this.prepareUpdateData(updates);
      const firestoreUpdates = this.mapEntityToFirestore(preparedUpdates);
      
      await updateDoc(docRef, firestoreUpdates);
      
      // 取得更新後的文件
      const updatedDocSnap = await getDoc(docRef);
      return this.mapDocumentToEntity(updatedDocSnap as DocumentSnapshot<T>);
    } catch (error) {
      this.handleError(error, `update ${this.collectionName} with id ${id}`);
    }
  }

  /**
   * 刪除實體
   */
  async delete(id: ID): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      
      // 檢查文件是否存在
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`${this.collectionName} with id ${id} not found`);
      }

      await deleteDoc(docRef);
    } catch (error) {
      this.handleError(error, `delete ${this.collectionName} with id ${id}`);
    }
  }

  /**
   * 批次建立
   */
  async createMany(entities: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T[]> {
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, this.collectionName);
      const docRefs: any[] = [];

      entities.forEach(entity => {
        this.validateEntity(entity as Partial<T>);
        const preparedData = this.prepareCreateData(entity);
        const firestoreData = this.mapEntityToFirestore(preparedData as Partial<T>);
        const docRef = doc(collectionRef);
        batch.set(docRef, firestoreData);
        docRefs.push(docRef);
      });

      await batch.commit();

      // 取得建立的文件
      const createdEntities: T[] = [];
      for (const docRef of docRefs) {
        const docSnap = await getDoc(docRef);
        createdEntities.push(this.mapDocumentToEntity(docSnap as DocumentSnapshot<T>));
      }

      return createdEntities;
    } catch (error) {
      this.handleError(error, `create many ${this.collectionName}`);
    }
  }

  /**
   * 批次更新
   */
  async updateMany(updates: Array<{ id: ID; data: Partial<T> }>): Promise<T[]> {
    try {
      const batch = writeBatch(db);

      updates.forEach(({ id, data }) => {
        const docRef = doc(db, this.collectionName, id);
        const preparedUpdates = this.prepareUpdateData(data);
        const firestoreUpdates = this.mapEntityToFirestore(preparedUpdates);
        batch.update(docRef, firestoreUpdates);
      });

      await batch.commit();

      // 取得更新後的文件
      const updatedEntities: T[] = [];
      for (const { id } of updates) {
        const entity = await this.findById(id);
        if (entity) {
          updatedEntities.push(entity);
        }
      }

      return updatedEntities;
    } catch (error) {
      this.handleError(error, `update many ${this.collectionName}`);
    }
  }

  /**
   * 批次刪除
   */
  async deleteMany(ids: ID[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      ids.forEach(id => {
        const docRef = doc(db, this.collectionName, id);
        batch.delete(docRef);
      });

      await batch.commit();
    } catch (error) {
      this.handleError(error, `delete many ${this.collectionName}`);
    }
  }

  /**
   * 檢查實體是否存在
   */
  async exists(id: ID): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      this.handleError(error, `check existence of ${this.collectionName} with id ${id}`);
    }
  }

  /**
   * 計算符合條件的實體數量
   */
  async count(criteria?: Partial<T>): Promise<number> {
    try {
      const collectionRef = collection(db, this.collectionName);
      
      if (criteria && Object.keys(criteria).length > 0) {
        const constraints: QueryConstraint[] = [];
        Object.entries(criteria).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            constraints.push(where(key, '==', value));
          }
        });
        const q = query(collectionRef, ...constraints);
        const countSnapshot = await getCountFromServer(q);
        return countSnapshot.data().count;
      } else {
        const countSnapshot = await getCountFromServer(collectionRef);
        return countSnapshot.data().count;
      }
    } catch (error) {
      this.handleError(error, `count ${this.collectionName}`);
    }
  }

  /**
   * 訂閱實體變更
   */
  subscribe(callback: (entities: T[]) => void): Unsubscribe {
    const collectionRef = collection(db, this.collectionName);
    
    return onSnapshot(collectionRef, (snapshot) => {
      const entities = snapshot.docs.map(doc => this.mapDocumentToEntity(doc as QueryDocumentSnapshot<T>));
      callback(entities);
    }, (error) => {
      console.error(`Subscription error for ${this.collectionName}:`, error);
    });
  }

  /**
   * 訂閱單一實體變更
   */
  subscribeById(id: ID, callback: (entity: T | null) => void): Unsubscribe {
    const docRef = doc(db, this.collectionName, id);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const entity = this.mapDocumentToEntity(snapshot as DocumentSnapshot<T>);
        callback(entity);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Subscription error for ${this.collectionName} id ${id}:`, error);
    });
  }

  /**
   * 訂閱查詢結果變更
   */
  subscribeToQuery(criteria: Partial<T>, callback: (entities: T[]) => void): Unsubscribe {
    const collectionRef = collection(db, this.collectionName);
    const constraints: QueryConstraint[] = [];

    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        constraints.push(where(key, '==', value));
      }
    });

    const q = query(collectionRef, ...constraints);
    
    return onSnapshot(q, (snapshot) => {
      const entities = snapshot.docs.map(doc => this.mapDocumentToEntity(doc as QueryDocumentSnapshot<T>));
      callback(entities);
    }, (error) => {
      console.error(`Query subscription error for ${this.collectionName}:`, error);
    });
  }

  /**
   * 批次操作
   */
  batch(): FirebaseBatch<T> {
    return new FirebaseBatchImpl<T>(this.collectionName, this);
  }

  /**
   * 將 Firestore 文件映射為實體
   */
  protected mapDocumentToEntity(doc: DocumentSnapshot<T> | QueryDocumentSnapshot<T>): T {
    const data = doc.data();
    if (!data) {
      throw new Error(`No data found in document ${doc.id}`);
    }

    return {
      ...this.mapFirestoreToEntity(data),
      id: doc.id,
    } as T;
  }

  /**
   * 將實體映射為 Firestore 資料
   * 子類別可以覆寫此方法來處理特殊的資料轉換
   */
  protected mapEntityToFirestore(entity: Partial<T>): any {
    const firestoreData = { ...entity };
    
    // 轉換 Date 為 Firestore Timestamp
    Object.keys(firestoreData).forEach(key => {
      const value = (firestoreData as any)[key];
      if (value instanceof Date) {
        (firestoreData as any)[key] = Timestamp.fromDate(value);
      }
    });

    return firestoreData;
  }

  /**
   * 將 Firestore 資料映射為實體
   * 子類別可以覆寫此方法來處理特殊的資料轉換
   */
  protected mapFirestoreToEntity(data: DocumentData): Partial<T> {
    const entityData = { ...data };
    
    // 轉換 Firestore Timestamp 為 Date
    Object.keys(entityData).forEach(key => {
      const value = entityData[key];
      if (value && typeof value.toDate === 'function') {
        entityData[key] = value.toDate();
      }
    });

    return entityData as Partial<T>;
  }
}

/**
 * Firebase 批次操作實作
 */
class FirebaseBatchImpl<T extends BaseEntity> implements FirebaseBatch<T> {
  private batch = writeBatch(db);

  constructor(
    private collectionName: string,
    private repository: FirebaseRepository<T, string>
  ) {}

  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): FirebaseBatch<T> {
    const collectionRef = collection(db, this.collectionName);
    const docRef = doc(collectionRef);
    const preparedData = (this.repository as any).prepareCreateData(entity);
    const firestoreData = (this.repository as any).mapEntityToFirestore(preparedData);
    
    this.batch.set(docRef, firestoreData);
    return this;
  }

  update(id: string, updates: Partial<T>): FirebaseBatch<T> {
    const docRef = doc(db, this.collectionName, id);
    const preparedUpdates = (this.repository as any).prepareUpdateData(updates);
    const firestoreUpdates = (this.repository as any).mapEntityToFirestore(preparedUpdates);
    
    this.batch.update(docRef, firestoreUpdates);
    return this;
  }

  delete(id: string): FirebaseBatch<T> {
    const docRef = doc(db, this.collectionName, id);
    this.batch.delete(docRef);
    return this;
  }

  async commit(): Promise<void> {
    await this.batch.commit();
  }
}
