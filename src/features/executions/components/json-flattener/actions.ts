"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { jsonFlattenerChannel } from "@/inngest/channels/json-flattener";

export type JsonFlattenerToken = Realtime.Token<typeof jsonFlattenerChannel, ["status"]>;

export async function fetchJsonFlattenerRealtimeToken(): Promise<JsonFlattenerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: jsonFlattenerChannel(),
        topics: ["status"],
    });

    return token;
}
