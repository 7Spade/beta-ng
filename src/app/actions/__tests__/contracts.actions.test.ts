/**
 * Tests for Contract Server Actions
 * Tests the refactored server actions to ensure they work correctly with services
 */

import { createProjectAndContractFromDocument } from '../contracts.actions';
import { contractService } from '@/services/contracts/contract.service';
import { projectService } from '@/services/projects/project.service';
import type { WorkItem } from '@/components/features/documents/work-items-table';

// Mock the services
jest.mock('@/services/contracts/contract.service');
jest.mock('@/services/projects/project.service');

const mockContractService = contractService as jest.Mocked<typeof contractService>;
const mockProjectService = projectService as jest.Mocked<typeof projectService>;

describe('createProjectAndContractFromDocument', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDocDetails = {
    customId: 'DOC-001',
    name: '測試專案',
    client: '測試客戶',
    clientRepresentative: '客戶代表'
  };

  const mockWorkItems: WorkItem[] = [
    {
      item: '網站設計',
      quantity: 1,
      unitPrice: 50000,
      price: 50000
    },
    {
      item: '系統開發',
      quantity: 2,
      unitPrice: 100000,
      price: 200000
    }
  ];

  const mockInput = {
    docDetails: mockDocDetails,
    workItems: mockWorkItems
  };

  it('should successfully create project and contract', async () => {
    // Arrange
    const mockProject = {
      id: 'project-123',
      customId: 'DOC-001',
      title: '測試專案',
      description: '從文件 "測試專案" 建立的專案',
      client: '測試客戶',
      clientRepresentative: '客戶代表',
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      tasks: expect.any(Array),
      value: 250000,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    };

    const mockContract = {
      id: 'contract-456',
      customId: 'DOC-001',
      name: '測試專案',
      contractor: '本公司',
      client: '測試客戶',
      clientRepresentative: '客戶代表',
      totalValue: 250000,
      status: '啟用中' as const,
      scope: '基於文件 "測試專案" 的工作項目。',
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      payments: [],
      changeOrders: [],
      versions: [{
        version: 1,
        date: expect.any(Date),
        changeSummary: 'Initial contract creation'
      }],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    };

    mockProjectService.createProjectFromDocument.mockResolvedValue(mockProject);
    mockContractService.createContract.mockResolvedValue(mockContract);

    // Act
    const result = await createProjectAndContractFromDocument(mockInput);

    // Assert
    expect(result).toEqual({
      projectId: 'project-123',
      contractId: 'contract-456'
    });

    expect(mockProjectService.createProjectFromDocument).toHaveBeenCalledWith({
      customId: 'DOC-001',
      title: '測試專案',
      description: '從文件 "測試專案" 建立的專案',
      client: '測試客戶',
      clientRepresentative: '客戶代表',
      tasks: expect.arrayContaining([
        expect.objectContaining({
          title: '網站設計',
          quantity: 1,
          unitPrice: 50000,
          value: 50000,
          status: '待處理',
          subTasks: []
        }),
        expect.objectContaining({
          title: '系統開發',
          quantity: 2,
          unitPrice: 100000,
          value: 200000,
          status: '待處理',
          subTasks: []
        })
      ]),
      totalValue: 250000,
      startDate: expect.any(Date),
      endDate: expect.any(Date)
    });

    expect(mockContractService.createContract).toHaveBeenCalledWith({
      customId: 'DOC-001',
      name: '測試專案',
      contractor: '本公司',
      client: '測試客戶',
      clientRepresentative: '客戶代表',
      totalValue: 250000,
      status: '啟用中',
      scope: '基於文件 "測試專案" 的工作項目。',
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      payments: [],
      changeOrders: []
    });
  });

  it('should handle project service error', async () => {
    // Arrange
    const errorMessage = 'Project creation failed';
    mockProjectService.createProjectFromDocument.mockRejectedValue(new Error(errorMessage));

    // Act
    const result = await createProjectAndContractFromDocument(mockInput);

    // Assert
    expect(result).toEqual({
      error: `建立失敗：${errorMessage}`
    });

    expect(mockProjectService.createProjectFromDocument).toHaveBeenCalled();
    expect(mockContractService.createContract).not.toHaveBeenCalled();
  });

  it('should handle contract service error', async () => {
    // Arrange
    const mockProject = {
      id: 'project-123',
      customId: 'DOC-001',
      title: '測試專案',
      description: '從文件 "測試專案" 建立的專案',
      client: '測試客戶',
      clientRepresentative: '客戶代表',
      startDate: new Date(),
      endDate: new Date(),
      tasks: [],
      value: 250000,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const errorMessage = 'Contract creation failed';
    mockProjectService.createProjectFromDocument.mockResolvedValue(mockProject);
    mockContractService.createContract.mockRejectedValue(new Error(errorMessage));

    // Act
    const result = await createProjectAndContractFromDocument(mockInput);

    // Assert
    expect(result).toEqual({
      error: `建立失敗：${errorMessage}`
    });

    expect(mockProjectService.createProjectFromDocument).toHaveBeenCalled();
    expect(mockContractService.createContract).toHaveBeenCalled();
  });

  it('should handle unknown error', async () => {
    // Arrange
    mockProjectService.createProjectFromDocument.mockRejectedValue('Unknown error');

    // Act
    const result = await createProjectAndContractFromDocument(mockInput);

    // Assert
    expect(result).toEqual({
      error: '建立失敗：發生未知錯誤。'
    });
  });

  it('should correctly calculate total value from work items', async () => {
    // Arrange
    const mockProject = {
      id: 'project-123',
      customId: 'DOC-001',
      title: '測試專案',
      description: '從文件 "測試專案" 建立的專案',
      client: '測試客戶',
      clientRepresentative: '客戶代表',
      startDate: new Date(),
      endDate: new Date(),
      tasks: [],
      value: 250000,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockContract = {
      id: 'contract-456',
      customId: 'DOC-001',
      name: '測試專案',
      contractor: '本公司',
      client: '測試客戶',
      clientRepresentative: '客戶代表',
      totalValue: 250000,
      status: '啟用中' as const,
      scope: '基於文件 "測試專案" 的工作項目。',
      startDate: new Date(),
      endDate: new Date(),
      payments: [],
      changeOrders: [],
      versions: [{
        version: 1,
        date: new Date(),
        changeSummary: 'Initial contract creation'
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockProjectService.createProjectFromDocument.mockResolvedValue(mockProject);
    mockContractService.createContract.mockResolvedValue(mockContract);

    // Act
    await createProjectAndContractFromDocument(mockInput);

    // Assert
    expect(mockProjectService.createProjectFromDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        totalValue: 250000 // 50000 + 200000
      })
    );

    expect(mockContractService.createContract).toHaveBeenCalledWith(
      expect.objectContaining({
        totalValue: 250000 // 50000 + 200000
      })
    );
  });

  it('should convert work items to tasks correctly', async () => {
    // Arrange
    const mockProject = {
      id: 'project-123',
      customId: 'DOC-001',
      title: '測試專案',
      description: '從文件 "測試專案" 建立的專案',
      client: '測試客戶',
      clientRepresentative: '客戶代表',
      startDate: new Date(),
      endDate: new Date(),
      tasks: [],
      value: 250000,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockContract = {
      id: 'contract-456',
      customId: 'DOC-001',
      name: '測試專案',
      contractor: '本公司',
      client: '測試客戶',
      clientRepresentative: '客戶代表',
      totalValue: 250000,
      status: '啟用中' as const,
      scope: '基於文件 "測試專案" 的工作項目。',
      startDate: new Date(),
      endDate: new Date(),
      payments: [],
      changeOrders: [],
      versions: [{
        version: 1,
        date: new Date(),
        changeSummary: 'Initial contract creation'
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockProjectService.createProjectFromDocument.mockResolvedValue(mockProject);
    mockContractService.createContract.mockResolvedValue(mockContract);

    // Act
    await createProjectAndContractFromDocument(mockInput);

    // Assert
    const projectCall = mockProjectService.createProjectFromDocument.mock.calls[0][0];
    expect(projectCall.tasks).toHaveLength(2);
    
    expect(projectCall.tasks[0]).toMatchObject({
      title: '網站設計',
      status: '待處理',
      quantity: 1,
      unitPrice: 50000,
      value: 50000,
      subTasks: []
    });

    expect(projectCall.tasks[1]).toMatchObject({
      title: '系統開發',
      status: '待處理',
      quantity: 2,
      unitPrice: 100000,
      value: 200000,
      subTasks: []
    });
  });
});