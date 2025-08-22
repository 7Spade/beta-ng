"use server";

import { extractWorkItems, type ExtractWorkItemsOutput } from '@/ai/flows/extract-work-items-flow';
import { z } from 'zod';

const actionInputSchema = z.object({
  documentDataUri: z.string().startsWith('data:'),
});

type ActionState = {
  data?: ExtractWorkItemsOutput;
  error?: string;
  fileName?: string;
}

export async function extractDataFromDocument(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const file = formData.get('file') as File | null;
  
  if (!file || file.size === 0) {
    return { error: '請選擇要上傳的檔案。' };
  }

  try {
    const fileBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(fileBuffer).toString('base64');
    const documentDataUri = `data:${file.type};base64,${base64String}`;
    
    const validatedInput = actionInputSchema.safeParse({ documentDataUri });
    if (!validatedInput.success) {
      return { error: '無效的檔案資料 URI。' };
    }

    const result = await extractWorkItems(validatedInput.data);
    
    if (!result || !result.workItems) {
        return { error: '提取資料失敗。AI 模型回傳了非預期的結果。' };
    }

    return { data: result, fileName: file.name };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : '發生未知錯誤。';
    return { error: `處理文件失敗。請確認檔案未損壞並再試一次。` };
  }
}
