import type { NodeExecuter } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import handlebars from "handlebars";
import { geminiChannel } from "@/inngest/channels/gemini";
import { createGoogleGenerativeAI } from "@ai-sdk/google"

handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new handlebars.SafeString(jsonString);
    return safeString;
});

type GeminiData = {
    variableName?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const geminiExecuter: NodeExecuter<GeminiData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        geminiChannel().status(
            {
                nodeId,
                status: "loading",
            })
    );

    if (!data.variableName || !data.userPrompt) {
        await publish(
            geminiChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw new NonRetriableError("variableName and userPrompt are required");
    }

    const systemPrompt = data.systemPrompt
        ? handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful asistant.";


    const userPrompt = handlebars.compile(data.userPrompt || "")(context);


    // todo
    const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    const google = createGoogleGenerativeAI({
        apiKey: credentialValue,
    });

    try {
        const { steps } = await step.ai.wrap(
            "gemini-generate-text",
            generateText,
            {
                model: google(data.model || "gemini-2.5-flash"),
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
            geminiChannel().status(
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
            geminiChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw error;
    }

}
