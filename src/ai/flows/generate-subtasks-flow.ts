'use server';

/**
 * @fileOverview 子任務建議生成流程
 * @description 此 AI 流程基於專案主標題和母任務標題，為使用者生成 3 到 5 個可行的子任務建議。
 * @exports generateSubtasks - 觸發子任務建議生成過程的函數。
 * @exports GenerateSubtasksInput - generateSubtasks 函數的輸入類型。
 * @exports GenerateSubtasksOutput - generateSubtasks 函數的返回類型。
 */

import { ai } from '@/ai/genkit';
import { logAiTokenUsage } from '@/services/logging.service';
import { z } from 'zod';

const GenerateSubtasksInputSchema = z.object({
  projectTitle: z.string().describe('The title of the main project.'),
  taskTitle: z.string().describe('The title of the parent task for which to generate sub-tasks.'),
});
export type GenerateSubtasksInput = z.infer<typeof GenerateSubtasksInputSchema>;

const GenerateSubtasksOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of 3 to 5 relevant sub-task titles.'),
});
export type GenerateSubtasksOutput = z.infer<typeof GenerateSubtasksOutputSchema>;


export async function generateSubtasks(input: GenerateSubtasksInput): Promise<GenerateSubtasksOutput> {
  return generateSubtasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSubtasksPrompt',
  input: { schema: GenerateSubtasksInputSchema },
  output: { schema: GenerateSubtasksOutputSchema },
  prompt: `You are an expert construction project manager. Given a project title and a main task, generate a list of 3 to 5 realistic, actionable sub-tasks.

Project Title: {{{projectTitle}}}
Main Task: {{{taskTitle}}}

Provide only the list of sub-task titles in your response.`,
});

const generateSubtasksFlow = ai.defineFlow(
  {
    name: 'generateSubtasksFlow',
    inputSchema: GenerateSubtasksInputSchema,
    outputSchema: GenerateSubtasksOutputSchema,
  },
  async (input) => {
    let result;
    try {
        result = await prompt(input);
        const output = result.output;
        if (!output) {
          throw new Error('No output from AI');
        }

        const totalTokens = result.usage?.totalTokens || 0;
        await logAiTokenUsage({
            flowName: 'generateSubtasksFlow',
            totalTokens: totalTokens,
            status: 'succeeded',
        });
        
        return output;
    } catch(error) {
        const totalTokens = result?.usage?.totalTokens || 0;
        await logAiTokenUsage({
            flowName: 'generateSubtasksFlow',
            totalTokens: totalTokens,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
    }
  }
);
