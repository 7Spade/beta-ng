'use server';

/**
 * @fileOverview 工作流程優化建議流程
 * @description 此 AI 流程分析歷史交易數據和目前的工作流程定義，以提供可行的優化建議、預測的效率提升百分比，以及詳細的理由說明。
 * @exports suggestWorkflowOptimizations - 觸發流程優化建議過程的函數。
 * @exports SuggestWorkflowOptimizationsInput - suggestWorkflowOptimizations 函數的輸入類型。
 * @exports SuggestWorkflowOptimizationsOutput - suggestWorkflowOptimizations 函數的返回類型。
 */

import {ai} from '@/ai/genkit';
import { logAiTokenUsage } from '@/services/logging.service';
import {z} from 'genkit';

const SuggestWorkflowOptimizationsInputSchema = z.object({
  historicalTransactionData: z
    .string()
    .describe(
      'Historical transaction data, including transaction times, partner performance metrics, and any other relevant data points.'
    ),
  currentWorkflowDefinition: z
    .string()
    .describe('A description of the current workflow definition.'),
});
export type SuggestWorkflowOptimizationsInput = z.infer<
  typeof SuggestWorkflowOptimizationsInputSchema
>;

const SuggestWorkflowOptimizationsOutputSchema = z.object({
  suggestedOptimizations: z
    .string()
    .describe(
      'A list of suggested optimizations for the workflow, based on the historical transaction data.'
    ),
  predictedEfficiencyIncrease: z
    .string()
    .describe(
      'The predicted efficiency increase as a percentage, if the suggested optimizations are implemented.'
    ),
  rationale: z
    .string()
    .describe(
      'A detailed rationale for each suggested optimization, explaining why it is expected to improve efficiency.'
    ),
});
export type SuggestWorkflowOptimizationsOutput = z.infer<
  typeof SuggestWorkflowOptimizationsOutputSchema
>;

export async function suggestWorkflowOptimizations(
  input: SuggestWorkflowOptimizationsInput
): Promise<SuggestWorkflowOptimizationsOutput> {
  return suggestWorkflowOptimizationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWorkflowOptimizationsPrompt',
  input: {schema: SuggestWorkflowOptimizationsInputSchema},
  output: {schema: SuggestWorkflowOptimizationsOutputSchema},
  prompt: `You are an AI-powered tool that analyzes historical transaction data and suggests workflow optimizations.

Analyze the historical transaction data and the current workflow definition to identify areas for improvement.

Based on your analysis, provide a list of suggested optimizations, a predicted efficiency increase as a percentage, and a detailed rationale for each suggested optimization.

Historical Transaction Data: {{{historicalTransactionData}}}
Current Workflow Definition: {{{currentWorkflowDefinition}}}`,
});

const suggestWorkflowOptimizationsFlow = ai.defineFlow(
  {
    name: 'suggestWorkflowOptimizationsFlow',
    inputSchema: SuggestWorkflowOptimizationsInputSchema,
    outputSchema: SuggestWorkflowOptimizationsOutputSchema,
  },
  async input => {
    let result;
    try {
        result = await prompt(input);
        const output = result.output;
        if (!output) {
          throw new Error('No output from AI');
        }

        await logAiTokenUsage({
            flowName: 'suggestWorkflowOptimizationsFlow',
            totalTokens: result.usage?.totalTokens || 0,
            status: 'succeeded',
        });
        
        return output;
    } catch (error) {
        await logAiTokenUsage({
            flowName: 'suggestWorkflowOptimizationsFlow',
            totalTokens: result?.usage?.totalTokens || 0,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
    }
  }
);
