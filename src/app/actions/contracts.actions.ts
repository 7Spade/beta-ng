"use server";

import { db } from "@/lib/firebase";
import { writeBatch, collection, doc, Timestamp } from "firebase/firestore";
import type { Task, Project, Contract } from "@/lib/types";
import type { WorkItem } from "@/components/documents/work-items-table";

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
        status: '待處理',
        lastUpdated: new Date().toISOString(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        value: item.price,
        subTasks: [],
    }));
}

export async function createProjectAndContractFromDocument(input: ActionInput): Promise<ActionResult> {
    const { docDetails, workItems } = input;
    const batch = writeBatch(db);

    try {
        // 1. Prepare Project data
        const newProjectRef = doc(collection(db, "projects"));
        const projectId = newProjectRef.id;
        const totalValue = workItems.reduce((sum, item) => sum + item.price, 0);
        const tasks = workItemsToTasks(workItems);

        const projectData: Omit<Project, "id" | "startDate" | "endDate"> & { startDate: Timestamp, endDate: Timestamp } = {
            customId: docDetails.customId,
            title: docDetails.name,
            description: `從文件 "${docDetails.name}" 建立的專案`,
            client: docDetails.client,
            clientRepresentative: docDetails.clientRepresentative,
            value: totalValue,
            tasks: tasks,
            startDate: Timestamp.now(),
            // Placeholder end date, maybe 1 month from now
            endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        };
        batch.set(newProjectRef, projectData);

        // 2. Prepare Contract data
        const newContractRef = doc(collection(db, "contracts"));
        const contractId = newContractRef.id;

        const contractData: Omit<Contract, "id" | "startDate" | "endDate" | "payments" | "changeOrders" | "versions"> & { startDate: Timestamp, endDate: Timestamp, payments: [], changeOrders: [], versions: any[] } = {
            customId: docDetails.customId,
            name: docDetails.name,
            contractor: "本公司", // Placeholder value
            client: docDetails.client,
            clientRepresentative: docDetails.clientRepresentative,
            totalValue: totalValue,
            status: "啟用中",
            scope: `基於文件 "${docDetails.name}" 的工作項目。`,
            startDate: projectData.startDate,
            endDate: projectData.endDate,
            payments: [],
            changeOrders: [],
            versions: [{
                version: 1,
                date: Timestamp.now(),
                changeSummary: "從文件提取的初始版本"
            }]
        };
        batch.set(newContractRef, contractData);

        // Commit the batch
        await batch.commit();

        return { projectId, contractId };

    } catch (e) {
        console.error("從文件建立專案和合約時發生錯誤：", e);
        const errorMessage = e instanceof Error ? e.message : "發生未知錯誤。";
        return { error: `建立失敗：${errorMessage}` };
    }
}
