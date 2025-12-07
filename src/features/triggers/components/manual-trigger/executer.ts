import type { NodeExecuter } from "@/features/executions/types";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecuter: NodeExecuter<ManualTriggerData> = async({
    nodeId,
    context,
    step,
})=>{


 const result = await step.run("manual-trigger", async () => context);

 return result;
}
