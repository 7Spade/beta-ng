'use server';

/**
 * @fileOverview 合約摘要流程
 * @description 此 AI 流程接收一份合約文件，並生成一份包含關鍵條款、義務和截止日期的簡潔摘要。
 * @exports summarizeContract - 觸發合約摘要過程的函數。
 * @exports SummarizeContractInput - summarizeContract 函數的輸入類型。
 * @exports SummarizeContractOutput - summarizeContract 函數的返回類型。
 */

import {ai} from '@/ai/genkit';
import { logAiTokenUsage } from '@/services/logging.service';
import {z} from 'genkit';

const SummarizeContractInputSchema = z.object({
  contractDataUri: z
    .string()
    .describe(
      'The contract document as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Inline comment
    ),
});
export type SummarizeContractInput = z.infer<typeof SummarizeContractInputSchema>;

const SummarizeContractOutputSchema = z.object({
  summary: z.string().describe('A summary of the key contract terms, obligations, and deadlines.'),
});
export type SummarizeContractOutput = z.infer<typeof SummarizeContractOutputSchema>;

export async function summarizeContract(input: SummarizeContractInput): Promise<SummarizeContractOutput> {
  return summarizeContractFlow(input);
}

const summarizeContractPrompt = ai.definePrompt({
  name: 'summarizeContractPrompt',
  input: {schema: SummarizeContractInputSchema},
  output: {schema: SummarizeContractOutputSchema},
  prompt: `You are an AI assistant specialized in summarizing legal contracts.

  Given a contract document, provide a concise summary of the key terms, obligations, and deadlines.
  Focus on extracting critical information that a project manager would need to quickly understand the contract details.

  Contract Document: {{media url=contractDataUri}}
  Summary: `,
});

const summarizeContractFlow = ai.defineFlow(
  {
    name: 'summarizeContractFlow',
    inputSchema: SummarizeContractInputSchema,
    outputSchema: SummarizeContractOutputSchema,
  },
  async input => {
    let result;
    try {
      result = await summarizeContractPrompt(input);
      const output = result.output;
      if (!output) {
        throw new Error('No output from AI');
      }

      await logAiTokenUsage({
        flowName: 'summarizeContractFlow',
        totalTokens: result.usage?.totalTokens || 0,
        status: 'succeeded',
      });
      
      return output;
    } catch(error) {
        await logAiTokenUsage({
            flowName: 'summarizeContractFlow',
            totalTokens: result?.usage?.totalTokens || 0,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
    }
  }
);
