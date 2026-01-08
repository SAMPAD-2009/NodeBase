import { channel, topic } from "@inngest/realtime";

export const SUPABASE_CHANNEL_NAME = "supabase-execution";

export const supabaseChannel = channel(SUPABASE_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string;
            status: "loading" | "success" | "error";
        }>(),
    );