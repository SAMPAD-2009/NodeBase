import type { NodeExecuter } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import handlebars from "handlebars";
import { createAnthropic } from "@ai-sdk/anthropic";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import prisma from "@/lib/db";

handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new handlebars.SafeString(jsonString);
    return safeString;
});

type AnthropicData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const anthropicExecuter: NodeExecuter<AnthropicData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {

    await publish(
        anthropicChannel().status(
            {
                nodeId,
                status: "loading",
            })
    );

    if (!data.variableName || !data.userPrompt || !data.credentialId) {
        await publish(
            anthropicChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw new NonRetriableError("variableName, userPrompt and credentialId are required");
    }

    const systemPrompt = data.systemPrompt
        ? handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful asistant.";


    const userPrompt = handlebars.compile(data.userPrompt || "")(context);

    const credentialValue = await step.run("get-credential", () => {
        return prisma.credentials.findUniqueOrThrow({
            where: {
                id: data.credentialId,
                userId,
            },
        })
    });

    if (!credentialValue) {
        await publish(
            anthropicChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw new NonRetriableError("credential not found");
    }

    const anthropic = createAnthropic({
        apiKey: credentialValue.value,
    });

    try {
        const { steps } = await step.ai.wrap(
            "anthropic-generate-text",
            generateText,
            {
                model: anthropic(data.model || "claude-3.5-sonnet"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                },
            },
        )

        const text = steps[0].content[0].type === "text"
            ? steps[0].content[0].text
            : "";

        await publish(
            anthropicChannel().status(
                {
                    nodeId,
                    status: "success",
                })
        );

        return {
            ...context,
            [data.variableName]: {
                aiResponse: text,
            },
        }

    } catch (error) {
        await publish(
            anthropicChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw error;
    }

}
