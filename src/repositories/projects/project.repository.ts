/**
 * Project Repository Implementation
 * Handles project data access operations with Firebase Firestore
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FirebaseRepository } from '../base/firebase.repository';
import { Project, ProjectFilters, ProjectStats } from '../../types/entities/project.types';
import { CreateProjectDto, UpdateProjectDto } from '../../types/dto/project.dto';
import { transformFirebaseTimestamp } from '../../utils/transformation/firebase.transformer';

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  create(projectData: CreateProjectDto): Promise<Project>;
  update(id: string, updates: UpdateProjectDto): Promise<Project>;
  delete(id: string): Promise<void>;
  findProjects(options: { filters?: ProjectFilters }): Promise<{ projects: Project[]; total: number }>;
  getProjectStats(): Promise<ProjectStats>;
}

/**
 * Project Repository Implementation
 */
export class ProjectRepository extends FirebaseRepository<Project> implements IProjectRepository {
  protected collectionName = 'projects';

  constructor() {
    super('projects');
  }

  /**
   * Create a new project
   */
  async create(projectData: CreateProjectDto): Promise<Project> {
    try {
      const projectToCreate = {
        ...projectData,
        startDate: Timestamp.fromDate(projectData.startDate),
        endDate: Timestamp.fromDate(projectData.endDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.collectionName), projectToCreate);
      
      const createdDoc = await getDoc(docRef);
      if (!createdDoc.exists()) {
        throw new Error('Failed to retrieve created project');
      }

      return this.transformDocument(createdDoc);
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing project
   */
  async update(id: string, updates: UpdateProjectDto): Promise<Project> {
    try {
      const docRef = doc(db, this.collectionName, id);
      
      // Transform dates to Timestamps if present
      const updateData: any = { ...updates };
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }
      updateData.updatedAt = Timestamp.now();

      await updateDoc(docRef, updateData);
      
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error(`Project with ID ${id} not found after update`);
      }

      return this.transformDocument(updatedDoc);
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error(`Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find projects with filters
   */
  async findProjects(options: { filters?: ProjectFilters }): Promise<{ projects: Project[]; total: number }> {
    try {
      let projectQuery = query(collection(db, this.collectionName));

      // Apply filters
      if (options.filters) {
        const { client, dateRange, valueRange } = options.filters;

        if (client) {
          projectQuery = query(projectQuery, where('client', '==', client));
        }

        if (dateRange) {
          projectQuery = query(
            projectQuery,
            where('startDate', '>=', Timestamp.fromDate(dateRange.startDate)),
            where('startDate', '<=', Timestamp.fromDate(dateRange.endDate))
          );
        }

        if (valueRange) {
          projectQuery = query(
            projectQuery,
            where('value', '>=', valueRange.min),
            where('value', '<=', valueRange.max)
          );
        }
      }

      // Add ordering
      projectQuery = query(projectQuery, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(projectQuery);
      const projects = querySnapshot.docs.map(doc => this.transformDocument(doc));

      return {
        projects,
        total: projects.length
      };
    } catch (error) {
      console.error('Error finding projects:', error);
      throw new Error(`Failed to find projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(): Promise<ProjectStats> {
    try {
      const projects = await this.findAll();
      
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => {
        const now = new Date();
        return p.startDate <= now && p.endDate >= now;
      }).length;
      
      const completedProjects = projects.filter(p => {
        const now = new Date();
        return p.endDate < now;
      }).length;
      
      const totalValue = projects.reduce((sum, p) => sum + p.value, 0);
      const averageValue = totalProjects > 0 ? totalValue / totalProjects : 0;
      const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        totalValue,
        averageValue,
        completionRate
      };
    } catch (error) {
      console.error('Error getting project stats:', error);
      throw new Error(`Failed to get project stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transform Firestore document to Project entity
   */
  protected transformDocument(doc: any): Project {
    const data = doc.data();
    
    return {
      id: doc.id,
      customId: data.customId,
      title: data.title,
      description: data.description,
      client: data.client,
      clientRepresentative: data.clientRepresentative,
      startDate: transformFirebaseTimestamp(data.startDate),
      endDate: transformFirebaseTimestamp(data.endDate),
      tasks: data.tasks || [],
      value: data.value,
      createdAt: transformFirebaseTimestamp(data.createdAt),
      updatedAt: transformFirebaseTimestamp(data.updatedAt),
    };
  }

  /**
   * Batch create multiple projects (useful for bulk operations)
   */
  async batchCreate(projects: CreateProjectDto[]): Promise<Project[]> {
    try {
      const batch = writeBatch(db);
      const projectRefs: any[] = [];

      projects.forEach(projectData => {
        const projectRef = doc(collection(db, this.collectionName));
        const projectToCreate = {
          ...projectData,
          startDate: Timestamp.fromDate(projectData.startDate),
          endDate: Timestamp.fromDate(projectData.endDate),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        
        batch.set(projectRef, projectToCreate);
        projectRefs.push(projectRef);
      });

      await batch.commit();

      // Fetch the created projects
      const createdProjects: Project[] = [];
      for (const ref of projectRefs) {
        const doc = await getDoc(ref);
        if (doc.exists()) {
          createdProjects.push(this.transformDocument(doc));
        }
      }

      return createdProjects;
    } catch (error) {
      console.error('Error batch creating projects:', error);
      throw new Error(`Failed to batch create projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}