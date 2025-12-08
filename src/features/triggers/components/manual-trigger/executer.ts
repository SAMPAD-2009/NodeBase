import type { NodeExecuter } from "@/features/executions/types";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecuter: NodeExecuter<ManualTriggerData> = async ({
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        manualTriggerChannel().status({
            nodeId,
            status: "loading",
        })
    );



    const result = await step.run("manual-trigger", async () => context);

    await publish(
        manualTriggerChannel().status({
            nodeId,
            status: "success",
        })
    );

    return result;
}
