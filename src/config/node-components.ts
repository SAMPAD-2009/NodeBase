import { InitialNode } from "@/components/initial-node";
import { AnthropicNode } from "@/features/executions/components/Anthropic/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { OpenaiNode } from "@/features/executions/components/Open-ai/node";
import { SlackNode } from "@/features/executions/components/slack/node";
import { SupabaseNode } from "@/features/executions/components/supabase-node/node";
import { CheerioNode } from "@/features/executions/components/cheerio/node";
import { ScreenshotNode } from "@/features/executions/components/screenshot/node";
import { JsonFlattenerNode } from "@/features/executions/components/json-flattener/node";
import { CronTriggerNode } from "@/features/triggers/components/cron/node";
import { GoogleFormTrigger } from "@/features/triggers/components/google form trigger/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe trigger/node";
import { NodeType } from "@/generated/prisma/client";
import type { NodeTypes } from "@xyflow/react";



export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
    [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
    [NodeType.GEMINI]: GeminiNode,
    [NodeType.OPENAI]: OpenaiNode,
    [NodeType.ANTHROPIC]: AnthropicNode,
    [NodeType.CRON]: CronTriggerNode,
    [NodeType.DISCORD]: DiscordNode,
    [NodeType.SLACK]: SlackNode,
    [NodeType.SUPABASE]: SupabaseNode,
    [NodeType.CHEERIO_EXTRACTOR]: CheerioNode,
    [NodeType.SCREENSHOT]: ScreenshotNode,
    [NodeType.JSON_FLATTENER]: JsonFlattenerNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;