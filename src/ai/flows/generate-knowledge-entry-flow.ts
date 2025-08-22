'use server';

/**
 * @fileOverview 工法庫內容生成流程
 * @description 此 AI 流程根據使用者提供的標題，自動生成一篇結構完整的工法工序庫文章，包含分類、Markdown 內容和關鍵字標籤。
 * @exports generateKnowledgeEntry - 觸發工法內容生成過程的函數。
 * @exports GenerateKnowledgeEntryInput - generateKnowledgeEntry 函數的輸入類型。
 * @exports GenerateKnowledgeEntryOutput - generateKnowledgeEntry 函數的返回類型。
 */

import { ai } from '@/ai/genkit';
import { logAiTokenUsage } from '@/services/logging.service';
import { z } from 'zod';

const GenerateKnowledgeEntryInputSchema = z.object({
  title: z.string().describe('The title of the knowledge base entry for which to generate content.'),
});
export type GenerateKnowledgeEntryInput = z.infer<typeof GenerateKnowledgeEntryInputSchema>;

const GenerateKnowledgeEntryOutputSchema = z.object({
  category: z.string().describe('A suggested category for the knowledge base entry.'),
  content: z.string().describe('The suggested content for the knowledge base entry, formatted in Markdown.'),
  tags: z.array(z.string()).describe('An array of 3-5 relevant keywords or tags.'),
  totalTokens: z.number().describe('The total number of tokens used for the operation.'),
});
export type GenerateKnowledgeEntryOutput = z.infer<typeof GenerateKnowledgeEntryOutputSchema>;


export async function generateKnowledgeEntry(input: GenerateKnowledgeEntryInput): Promise<GenerateKnowledgeEntryOutput> {
  return generateKnowledgeEntryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKnowledgeEntryPrompt',
  input: { schema: GenerateKnowledgeEntryInputSchema },
  output: { schema: GenerateKnowledgeEntryOutputSchema },
  prompt: `You are an expert in construction and civil engineering standard operating procedures.
Given the title for a knowledge base entry, generate the full content for it.

The content should be a detailed, professional, and practical guide written in Traditional Chinese. It must be formatted in Markdown, including headings, lists, and bold text for clarity.
Also suggest a relevant category and a list of 3-5 keywords (tags).

Title: {{{title}}}

Generate the content now.`,
});

const generateKnowledgeEntryFlow = ai.defineFlow(
  {
    name: 'generateKnowledgeEntryFlow',
    inputSchema: GenerateKnowledgeEntryInputSchema,
    outputSchema: GenerateKnowledgeEntryOutputSchema,
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
            flowName: 'generateKnowledgeEntryFlow',
            totalTokens: totalTokens,
            status: 'succeeded',
        });

        return {
            ...output,
            totalTokens: totalTokens,
        };
    } catch (error) {
        const totalTokens = result?.usage?.totalTokens || 0;
        await logAiTokenUsage({
            flowName: 'generateKnowledgeEntryFlow',
            totalTokens: totalTokens,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
    }
  }
);
