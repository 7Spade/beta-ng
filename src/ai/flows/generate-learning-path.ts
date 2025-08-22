'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a prioritized list of concepts to learn based on user input.
 *
 * - generateLearningPath - A function that takes user input (code snippet or description) and returns a prioritized list of concepts to learn.
 * - GenerateLearningPathInput - The input type for the generateLearningPath function.
 * - GenerateLearningPathOutput - The return type for the generateLearningPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLearningPathInputSchema = z.object({
  userInput: z
    .string()
    .describe(
      'A code snippet or a description of the user\'s current knowledge.'
    ),
});
export type GenerateLearningPathInput = z.infer<
  typeof GenerateLearningPathInputSchema
>;

const GenerateLearningPathOutputSchema = z.object({
  concepts: z
    .array(z.string())
    .describe('A prioritized list of concepts to learn next.'),
});
export type GenerateLearningPathOutput = z.infer<
  typeof GenerateLearningPathOutputSchema
>;

export async function generateLearningPath(
  input: GenerateLearningPathInput
): Promise<GenerateLearningPathOutput> {
  return generateLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLearningPathPrompt',
  input: {schema: GenerateLearningPathInputSchema},
  output: {schema: GenerateLearningPathOutputSchema},
  prompt: `You are an expert educator specializing in creating learning paths for software development.

  Based on the user's input, provide a prioritized list of concepts they should learn next.
  The concepts should be specific and actionable.

  User Input: {{{userInput}}}

  Prioritized List of Concepts:
  `,
});

const generateLearningPathFlow = ai.defineFlow(
  {
    name: 'generateLearningPathFlow',
    inputSchema: GenerateLearningPathInputSchema,
    outputSchema: GenerateLearningPathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
