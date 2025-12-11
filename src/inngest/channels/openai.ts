import { channel, topic } from "@inngest/realtime";

export const OPENAI_CHANNEL_NAME = "gemini-execution";

export const openaiChannel = channel(OPENAI_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error";
        }>(),
    );