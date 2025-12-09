import type { NodeExecuter } from "@/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

type StripeTriggerData = Record<string, unknown>;

export const stripeTriggerExecuter: NodeExecuter<StripeTriggerData> = async ({
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        stripeTriggerChannel().status({
            nodeId,
            status: "loading",
        })
    );



    const result = await step.run("stripe-trigger", async () => context);

    await publish(
        stripeTriggerChannel().status({
            nodeId,
            status: "success",
        })
    );

    return result;
}
