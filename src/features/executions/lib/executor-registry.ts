import { NodeType } from "@/generated/prisma/enums";
import { NodeExecuter } from "../types";
import { manualTriggerExecuter } from "@/features/triggers/components/manual-trigger/executer";
import { HttpRequestExecuter } from "../components/http-request/executer";
import { googleFormTriggerExecuter } from "@/features/triggers/components/google form trigger/executer";
import { stripeTriggerExecuter } from "@/features/triggers/components/stripe trigger/executer";
import { geminiExecuter } from "../components/gemini/executer";
import { openaiExecuter } from "../components/Open-ai/executer";
import { anthropicExecuter } from "../components/Anthropic/executer";
import { cronTriggerExecuter } from "@/features/triggers/components/cron/executer";

export const executorRegistry: Record<NodeType, NodeExecuter> = {
  [NodeType.MANUAL_TRIGGER] : manualTriggerExecuter,
  [NodeType.INITIAL]:manualTriggerExecuter,
  [NodeType.HTTP_REQUEST]:HttpRequestExecuter,
  [NodeType.GOOGLE_FORM_TRIGGER]:googleFormTriggerExecuter,
  [NodeType.STRIPE_TRIGGER]:stripeTriggerExecuter,
  [NodeType.GEMINI]:geminiExecuter,
  [NodeType.ANTHROPIC]:anthropicExecuter,
  [NodeType.OPENAI]:openaiExecuter,
  [NodeType.CRON]:cronTriggerExecuter,
};

export const getExecutor = (type:NodeType):NodeExecuter => {
  const executer = executorRegistry[type];
  if (!executer) {
    throw new Error(`No executor found for type ${type}`);
  }

  return executer;
}
