import type { NodeExecuter } from "@/features/executions/types";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import handlebars from "handlebars";
import { SlackChannel } from "@/inngest/channels/slack";
import ky from "ky";

handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new handlebars.SafeString(jsonString);
    return safeString;
});

type SlackData = {
    variableName?: string;
    webhookUrl?: string;
    content?: string;
};

export const slackExecuter: NodeExecuter<SlackData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        SlackChannel().status(
            {
                nodeId,
                status: "loading",
            })
    );

    if (!data.variableName || !data.content || !data.webhookUrl) {
        await publish(
            SlackChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw new NonRetriableError("variableName, content and webhookUrl are required");
    }

    const content = decode(handlebars.compile(data.content)(context));

    try {
        const result = await step.run("slack-message", async () => {
            await ky.post(data.webhookUrl!, {
                json: {
                    content: content.slice(0, 2000),
                },
            });

            return {
                ...context,
                [data.variableName!]: {
                    messageContent: content.slice(0, 2000),
                },
            };
        });
        


        await publish(
            SlackChannel().status(
                {
                    nodeId,
                    status: "success",
                })
        );

        return result;

    } catch (error) {
        await publish(
            SlackChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw error;
    }

}
