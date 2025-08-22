'use server';

import { db } from '@/lib/firebase';
import type { AiTokenLog } from '@/lib/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Logs an AI token usage event to Firestore.
 * This is a "fire-and-forget" operation and does not throw errors
 * to prevent it from blocking the main application flow.
 * @param logData - The data to be logged.
 */
export async function logAiTokenUsage(
    logData: Omit<AiTokenLog, 'id' | 'timestamp'>
): Promise<void> {
    try {
        const logPayload = {
            ...logData,
            timestamp: serverTimestamp(),
        };
        await addDoc(collection(db, 'aiTokenLogs'), logPayload);
    } catch (error) {
        console.error("Failed to log AI token usage:", error);
        // We don't re-throw the error to avoid interrupting the user's flow.
        // Logging failure should not impact the user experience.
    }
}
