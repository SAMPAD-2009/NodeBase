import { NodeType } from "@/generated/prisma/enums";
import { NodeExecuter } from "../types";
import { manualTriggerExecuter } from "@/features/triggers/components/manual-trigger/executer";
import { HttpRequestExecuter } from "../components/http-request/executer";
import { googleFormTriggerExecuter } from "@/features/triggers/components/google form trigger/executer";

export const executorRegistry: Record<NodeType, NodeExecuter> = {
  [NodeType.MANUAL_TRIGGER] : manualTriggerExecuter,
  [NodeType.INITIAL]:manualTriggerExecuter,
  [NodeType.HTTP_REQUEST]:HttpRequestExecuter,
  [NodeType.GOOGLE_FORM_TRIGGER]:googleFormTriggerExecuter,
};

export const getExecutor = (type:NodeType):NodeExecuter => {
  const executer = executorRegistry[type];
  if (!executer) {
    throw new Error(`No executor found for type ${type}`);
  }

  return executer;
}
