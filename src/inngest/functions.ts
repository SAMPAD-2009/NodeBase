import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import * as Sentry from "@sentry/nextjs";



const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    Sentry.logger.info("user triggered test log",{log_source:'sentry_test'})
    console.warn("Something went wrong");
    console.error("Something went really wrong");

    const { steps: geminiSteps } = await step.ai.wrap("gemini-generate-text",
      generateText, {
      model: google('gemini-2.5-flash'),
      system: "You are a helpful assistant.",
      prompt: "what is 2+2?",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      }
    }
    );
    const { steps: openaiSteps } = await step.ai.wrap("openai-generate-text",
      generateText, {
      model: openai('gpt-4o-mini'),
      system: "You are a helpful assistant.",
      prompt: "what is 2+2?",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      }
    }
    );
    const { steps: anthropicSteps } = await step.ai.wrap("anthropic-generate-text",
      generateText, {
      model: anthropic('claude-3-5-sonnet-20240620'),
      system: "You are a helpful assistant.",
      prompt: "what is 2+2?",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      }
    }
    );

    return {
      geminiSteps,
      openaiSteps,
      anthropicSteps,
    };
  },
);