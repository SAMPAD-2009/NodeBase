
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalsort } from "./util";
import { ExecutionStatus, NodeType } from "@/generated/prisma/client";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openaiChannel } from "./channels/openai";
import { anthropicChannel } from "./channels/anthropic";
import { cronTriggerChannel } from "./channels/cron";
import { DiscordChannel } from "./channels/discord";
import { supabaseChannel } from "./channels/supabase";
import { cheerioChannel } from "./channels/cheerio";
import { screenshotChannel } from "./channels/screenshot";
import { jsonFlattenerChannel } from "./channels/json-flattener";



export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0,
    onFailure: async ({ event, step }) => {
      // Find execution by inngest event ID
      const execution = await prisma.execution.findUnique({
        where: { inngestEventId: event.data.event.id },
      });

      if (execution) {
        return prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: ExecutionStatus.FAILED,
            completedAt: new Date(),
            error: event.data.error.message || "Unknown error",
            errorStack: event.data.error.stack || "",
          },
        });
      }
    }
  }, {
  event: "workflows/execute.workflow",
  channels: [
    httpRequestChannel(),
    manualTriggerChannel(),
    googleFormTriggerChannel(),
    stripeTriggerChannel(),
    geminiChannel(),
    openaiChannel(),
    anthropicChannel(),
    cronTriggerChannel(),
    DiscordChannel(),
    supabaseChannel(),
    cheerioChannel(),
    screenshotChannel(),
    jsonFlattenerChannel(),
  ],
},
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!workflowId || !inngestEventId) {
      throw new NonRetriableError("workflowId is required");
    }

    // Find the execution that was created in the router
    let execution = await step.run("find-execution", async () => {
      return prisma.execution.findFirst({
        where: {
          workflowId,
          status: ExecutionStatus.RUNNING,
        },
        orderBy: { startedAt: "desc" },
      });
    });

    // If not found, create it (fallback)
    if (!execution) {
      execution = await step.run("create-execution", async () => {
        const r = await prisma.execution.create({
          data: {
            workflowId,
            inngestEventId,
          },
        });
        return r;
      });
    } else {
      // Update with inngest event ID
      await step.run("update-execution-event-id", async () => {
        return prisma.execution.update({
          where: { id: execution!.id },
          data: { inngestEventId },
        });
      });
    }

    const executionId = execution.id;
    let context = event.data.initialData || {};
    if (executionId) context = { ...(context || {}), _executionId: executionId };

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      return topologicalsort(workflow.nodes, workflow.connections);
    });

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        select: {
          userId: true,
        }
      });
      return workflow.userId;
    });

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
        context,
        step,
        publish,
      });
    }

    await step.run("finalize-execution", async () => {
      await prisma.execution.update({
        where: { id: executionId },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        }
      });
    });

    return {
      workflowId,
      executionId,
      context,
    };
  },
);