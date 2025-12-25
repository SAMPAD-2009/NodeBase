import type { NodeExecuter } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import handlebars from "handlebars";
import { createOpenAI } from "@ai-sdk/openai";
import { openaiChannel } from "@/inngest/channels/openai";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new handlebars.SafeString(jsonString);
    return safeString;
});

type OpenaiData = {
    credentialId?: string;
    variableName?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const openaiExecuter: NodeExecuter<OpenaiData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {

    await publish(
        openaiChannel().status(
            {
                nodeId,
                status: "loading",
            })
    );

    if (!data.variableName || !data.userPrompt || !data.credentialId) {
        await publish(
            openaiChannel().status(
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


    const credentialValue = await step.run("get-credential", ()=>{
        return prisma.credentials.findUniqueOrThrow({
            where: {
                id: data.credentialId,
                userId,
            },
        })
    });

    if (!credentialValue){
        await publish(
            openaiChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw new NonRetriableError("credential not found");
    }

    const openai = createOpenAI({
        apiKey: decrypt(credentialValue.value),
    });

    try {
        const { steps } = await step.ai.wrap(
            "openai-generate-text",
            generateText,
            {
                model: openai(data.model || "gpt-4.1-mini"),
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
            openaiChannel().status(
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
            openaiChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw error;
    }

}
