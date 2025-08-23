"use server";

import type { Task } from "@/types/entities/project.types";
import type { WorkItem } from "@/components/features/documents/work-items-table";
import { contractService } from "@/services/contracts/contract.service";
import { projectService } from "@/services/projects/project.service";
import { CreateContractDto } from "@/types/dto/contract.dto";
import { CreateProjectFromDocumentDto } from "@/types/dto/project.dto";

interface DocDetails {
    customId: string;
    name: string;
    client: string;
    clientRepresentative: string;
}

interface ActionInput {
    docDetails: DocDetails;
    workItems: WorkItem[];
}

interface ActionResult {
    projectId?: string;
    contractId?: string;
    error?: string;
}

// Helper to convert work items to tasks
function workItemsToTasks(items: WorkItem[]): Task[] {
    return items.map((item, index) => ({
        id: `task-${Date.now()}-${index}`,
        title: item.item,
        status: '待處理' as const,
        lastUpdated: new Date().toISOString(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        value: item.price,
        subTasks: []
    }));
}

export async function createProjectAndContractFromDocument(input: ActionInput): Promise<ActionResult> {
    const { docDetails, workItems } = input;

    try {
        const totalValue = workItems.reduce((sum: number, item: WorkItem) => sum + item.price, 0);
        const tasks = workItemsToTasks(workItems);
        const startDate = new Date();
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 month from now

        // 1. Create Project using ProjectService
        const projectData: CreateProjectFromDocumentDto = {
            customId: docDetails.customId,
            title: docDetails.name,
            description: `從文件 "${docDetails.name}" 建立的專案`,
            client: docDetails.client,
            clientRepresentative: docDetails.clientRepresentative,
            tasks: tasks,
            totalValue: totalValue,
            startDate: startDate,
            endDate: endDate,
        };

        const createdProject = await projectService.createProjectFromDocument(projectData);

        // 2. Create Contract using ContractService
        const contractData: CreateContractDto = {
            customId: docDetails.customId,
            name: docDetails.name,
            contractor: "本公司", // Placeholder value
            client: docDetails.client,
            clientRepresentative: docDetails.clientRepresentative,
            totalValue: totalValue,
            status: "啟用中",
            scope: `基於文件 "${docDetails.name}" 的工作項目。`,
            startDate: startDate,
            endDate: endDate,
            payments: [],
            changeOrders: []
        };

        const createdContract = await contractService.createContract(contractData);

        return { 
            projectId: createdProject.id, 
            contractId: createdContract.id 
        };

    } catch (e) {
        console.error("從文件建立專案和合約時發生錯誤：", e);
        const errorMessage = e instanceof Error ? e.message : "發生未知錯誤。";
        return { error: `建立失敗：${errorMessage}` };
    }
}
