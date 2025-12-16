"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { cronTriggerChannel } from "@/inngest/channels/cron";

export type CronTriggerStatus = Realtime.Token<typeof cronTriggerChannel, ["status"]>;

export async function fetchCronTriggerRealtimeToken(): Promise<CronTriggerStatus> {
  const token = await getSubscriptionToken(inngest, {
    channel: cronTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
