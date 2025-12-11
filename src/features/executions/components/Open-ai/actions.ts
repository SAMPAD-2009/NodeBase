"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { openaiChannel } from "@/inngest/channels/openai";

export type OpenaiToken = Realtime.Token<typeof openaiChannel, ["status"]>;

export async function fetchOpenaiRealtimeToken(): Promise<OpenaiToken> {
 const token = await getSubscriptionToken(inngest ,{
    channel: openaiChannel(),
    topics: ["status"],
  });

  return token;
}
