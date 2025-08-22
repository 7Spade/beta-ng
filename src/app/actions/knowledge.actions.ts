'use server';

import { db } from '@/lib/firebase';
import type { KnowledgeBaseEntry } from '@/lib/types';
import { collection, addDoc, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

type SaveResult = {
    message: string;
    error?: undefined;
} | {
    error: string;
    message?: undefined;
}

export async function handleSaveKnowledgeBaseEntry(
    data: Omit<KnowledgeBaseEntry, 'id' | 'createdAt' | 'updatedAt'>,
    entryId?: string
): Promise<SaveResult> {
    try {
        if (entryId) {
            // Update existing entry
            const entryRef = doc(db, 'knowledgeBaseEntries', entryId);
            await setDoc(entryRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
        } else {
            // Add new entry
            await addDoc(collection(db, 'knowledgeBaseEntries'), {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }
        revalidatePath('/team/knowledge-base');
        return { message: `工法 "${data.title}" 已成功儲存。` };

    } catch (error) {
        console.error("儲存工法時發生錯誤：", error);
        const errorMessage = error instanceof Error ? error.message : "發生未知錯誤。";
        return { error: `儲存失敗: ${errorMessage}` };
    }
}

export async function handleDeleteKnowledgeBaseEntry(entryId: string): Promise<SaveResult> {
    try {
        await deleteDoc(doc(db, 'knowledgeBaseEntries', entryId));
        revalidatePath('/team/knowledge-base');
        return { message: "工法已成功刪除。" };
    } catch (error) {
        console.error("刪除工法時發生錯誤：", error);
        const errorMessage = error instanceof Error ? error.message : "發生未知錯誤。";
        return { error: `刪除失敗: ${errorMessage}` };
    }
}
