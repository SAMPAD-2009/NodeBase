"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { screenshotChannel } from "@/inngest/channels/screenshot";

export type ScreenshotToken = Realtime.Token<typeof screenshotChannel, ["status"]>;

export async function fetchScreenshotRealtimeToken(): Promise<ScreenshotToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: screenshotChannel(),
        topics: ["status"],
    });

    return token;
}
