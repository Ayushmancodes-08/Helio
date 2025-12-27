'use server';
/**
 * @fileOverview Guides the patient through a symptom assessment with structured questions.
 *
 * - guideSymptomAssessment - A function that handles the symptom assessment process.
 * - GuideSymptomAssessmentInput - The input type for the guideSymptomAssessment function.
 * - GuideSymptomAssessmentOutput - The return type for the guideSymptomAssessment function.
 */

import { ai } from '@/app/ai/genkit';
import { z } from 'genkit';

const GuideSymptomAssessmentInputSchema = z.object({
    symptoms: z
        .string()
        .describe('The symptoms that the patient is currently experiencing.'),
    medicalHistory: z
        .string()
        .optional()
        .describe('The medical history of the patient.'),
    age: z.number().optional().describe('The age of the patient.'),
    sex: z.string().optional().describe('The sex of the patient.'),
    conversationHistory: z.string().optional().describe('The previous conversation history.'),
    language: z.string().optional().describe('The language for the conversation (e.g., "English", "Hindi").')
});
export type GuideSymptomAssessmentInput = z.infer<
    typeof GuideSymptomAssessmentInputSchema
>;

const GuideSymptomAssessmentOutputSchema = z.object({
    nextQuestion: z
        .string()
        .describe('The next question to ask the patient about their symptoms.'),
    options: z.array(z.string()).optional().describe('A list of multiple-choice options for the user to select from.'),
    suggestedDiagnosis: z
        .string()
        .optional()
        .describe('A potential diagnosis based on the symptoms provided.'),
    urgencyAdvice: z
        .string()
        .optional()
        .describe(
            'Advice on whether the patient should seek urgent medical attention.'
        ),
    suggestedMedicines: z
        .string()
        .optional()
        .describe('Suggested over-the-counter medicines for the symptoms.'),
    homeRemedies: z
        .string()
        .optional()
        .describe('Suggested home remedies for the symptoms.'),
});
export type GuideSymptomAssessmentOutput = z.infer<
    typeof GuideSymptomAssessmentOutputSchema
>;

export async function guideSymptomAssessment(
    input: GuideSymptomAssessmentInput
): Promise<GuideSymptomAssessmentOutput> {
    return guideSymptomAssessmentFlow(input);
}

const prompt = ai.definePrompt({
    name: 'guideSymptomAssessmentPrompt',
    input: { schema: GuideSymptomAssessmentInputSchema },
    output: { schema: GuideSymptomAssessmentOutputSchema },
    prompt: `You are an AI assistant designed to guide patients through a symptom assessment using multiple-choice questions.

  Your goal is to understand the user's primary symptom and then ask a series of clarifying questions to gather more information.

  IMPORTANT: You must conduct the entire conversation in the specified language: {{{language}}}. All your questions, options, and advice must be in this language.

  1.  Start by asking for the primary symptom if it's not provided.
  2.  Once a symptom is mentioned (e.g., "headache"), ask a clarifying question with multiple-choice options. For example, for a headache, you could ask "How long have you had this headache?" with options like ["Less than a day", "1-3 days", "More than 3 days"].
  3.  Based on the user's selection, continue asking relevant follow-up questions, always providing multiple-choice options.
  4.  If the conversation seems to reach a logical point for a diagnosis or advice, provide suggestedDiagnosis, suggestedMedicines, homeRemedies, and urgencyAdvice. Until then, only provide the nextQuestion and options.
  5.  Keep the conversation flowing by analyzing the entire history.

  Current Conversation:
  {{{conversationHistory}}}

  User's latest input: {{{symptoms}}}
  `,
});

const guideSymptomAssessmentFlow = ai.defineFlow(
    {
        name: 'guideSymptomAssessmentFlow',
        inputSchema: GuideSymptomAssessmentInputSchema,
        outputSchema: GuideSymptomAssessmentOutputSchema,
    },
    async input => {
        const { output } = await prompt(input);
        return output!;
    }
);
