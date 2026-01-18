import { channel, topic } from "@inngest/realtime";

export const SCREENSHOT_CHANNEL_NAME = "screenshot-execution";

export const screenshotChannel = channel(SCREENSHOT_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error";
        }>(),
    );
