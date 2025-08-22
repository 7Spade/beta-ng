'use server';

/**
 * @fileOverview 技能建議生成流程
 * @description 此 AI 流程根據使用者提供的職位或主題（如「水電工」），建議 3 到 5 個相關的技能及其描述。
 * @exports generateSkillSuggestion - 觸發技能建議生成過程的函數。
 * @exports GenerateSkillInput - generateSkillSuggestion 函數的輸入類型。
 * @exports GenerateSkillOutput - generateSkillSuggestion 函數的返回類型。
 */

import { ai } from '@/ai/genkit';
import { logAiTokenUsage } from '@/services/logging.service';
import { z } from 'zod';

const GenerateSkillInputSchema = z.object({
  topic: z.string().describe('The topic or job role for which to generate skills. For example: "Plumber", "Electrician", "Project Manager".'),
});
export type GenerateSkillInput = z.infer<typeof GenerateSkillInputSchema>;

const GenerateSkillOutputSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string().describe('The name of the suggested skill.'),
      description: z.string().describe('A brief description of the skill.'),
    })
  ).describe('An array of 3 to 5 relevant skill suggestions.'),
  totalTokens: z.number().describe('The total number of tokens used for the operation.'),
});
export type GenerateSkillOutput = z.infer<typeof GenerateSkillOutputSchema>;


export async function generateSkillSuggestion(input: GenerateSkillInput): Promise<GenerateSkillOutput> {
  return generateSkillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSkillPrompt',
  input: { schema: GenerateSkillInputSchema },
  output: { schema: GenerateSkillOutputSchema },
  prompt: `You are an expert in human resources for the construction industry.
Given a topic or a job role, generate a list of 3 to 5 relevant skills, each with a name and a brief description.
The response should be in Traditional Chinese.

Topic/Role: {{{topic}}}

Provide the list of skills now.`,
});

const generateSkillFlow = ai.defineFlow(
  {
    name: 'generateSkillFlow',
    inputSchema: GenerateSkillInputSchema,
    outputSchema: GenerateSkillOutputSchema,
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
            flowName: 'generateSkillFlow',
            totalTokens: totalTokens,
            status: 'succeeded',
        });

        return {
            skills: output.skills,
            totalTokens: totalTokens,
        };
    } catch (error) {
        const totalTokens = result?.usage?.totalTokens || 0;
        await logAiTokenUsage({
            flowName: 'generateSkillFlow',
            totalTokens: totalTokens,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
    }
  }
);
