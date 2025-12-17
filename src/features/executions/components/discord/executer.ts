import type { NodeExecuter } from "@/features/executions/types";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import handlebars from "handlebars";
import { DiscordChannel } from "@/inngest/channels/discord";
import ky from "ky";

handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new handlebars.SafeString(jsonString);
    return safeString;
});

type DiscordData = {
    variableName?: string;
    webhookUrl?: string;
    content?: string;
    username?: string;
};

export const discordExecuter: NodeExecuter<DiscordData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        DiscordChannel().status(
            {
                nodeId,
                status: "loading",
            })
    );

    if (!data.variableName || !data.content || !data.webhookUrl) {
        await publish(
            DiscordChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw new NonRetriableError("variableName, content and webhookUrl are required");
    }

    const content = decode(handlebars.compile(data.content)(context));
    const username = data.username
        ? decode(handlebars.compile(data.username)(context))
        : undefined;

    try {
        const result = await step.run("discord-message", async () => {
            await ky.post(data.webhookUrl!, {
                json: {
                    content: content.slice(0, 2000),
                    username,
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
            DiscordChannel().status(
                {
                    nodeId,
                    status: "success",
                })
        );

        return result;

    } catch (error) {
        await publish(
            DiscordChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw error;
    }

}
