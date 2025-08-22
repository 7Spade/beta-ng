"use server";

import {
  generateLearningPath,
  type GenerateLearningPathInput,
  type GenerateLearningPathOutput,
} from "@/ai/flows/generate-learning-path";

type ActionResult = {
  success: boolean;
  data?: GenerateLearningPathOutput | null;
  error?: string;
};

export async function generateLearningPathAction(
  input: GenerateLearningPathInput
): Promise<ActionResult> {
  try {
    const output = await generateLearningPath(input);
    return { success: true, data: output };
  } catch (error) {
    console.error("Error generating learning path:", error);
    return {
      success: false,
      error:
        "Failed to generate learning path. The AI model might be temporarily unavailable. Please try again later.",
    };
  }
}
