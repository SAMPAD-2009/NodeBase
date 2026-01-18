import { channel, topic } from "@inngest/realtime";

export const CHEERIO_CHANNEL_NAME = "cheerio-execution";

export const cheerioChannel = channel(CHEERIO_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error";
        }>(),
    );
