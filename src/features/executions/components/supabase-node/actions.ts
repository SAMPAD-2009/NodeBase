"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { supabaseChannel } from "@/inngest/channels/supabase";
import { inngest } from "@/inngest/client";

export type SupabaseToken = Realtime.Token<typeof supabaseChannel, ["status"]>;

export async function fetchSupabaseRealtimeToken(): Promise<SupabaseToken> {
 const token = await getSubscriptionToken(inngest ,{
    channel: supabaseChannel(),
    topics: ["status"],
  });

  return token;
}
