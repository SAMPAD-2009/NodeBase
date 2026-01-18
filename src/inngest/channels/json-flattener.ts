import { channel, topic } from "@inngest/realtime";

export const JSON_FLATTENER_CHANNEL_NAME = "json-flattener-execution";

export const jsonFlattenerChannel = channel(JSON_FLATTENER_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error";
        }>(),
    );
