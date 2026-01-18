"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { cheerioChannel } from "@/inngest/channels/cheerio";

export type CheerioToken = Realtime.Token<typeof cheerioChannel, ["status"]>;

export async function fetchCheerioRealtimeToken(): Promise<CheerioToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: cheerioChannel(),
        topics: ["status"],
    });

    return token;
}
