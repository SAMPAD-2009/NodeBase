"use client";

import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Execution } from "@/generated/prisma/client";

/**
 * Hook to subscribe to realtime execution updates via Inngest
 * The execution status is updated automatically as it progresses from RUNNING to SUCCESS/FAILED
 */
export const useRealtimeExecution = (executionId: string) => {
  const [execution, setExecution] = useState<Execution | null>(null);
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!executionId) return;

    // Connect to the realtime event stream for this execution
    const eventSource = new EventSource(
      `/api/executions/${executionId}/stream`
    );

    eventSourceRef.current = eventSource;

    eventSource.addEventListener("execution-update", (event) => {
      try {
        const data = JSON.parse(event.data);
        setExecution(data);

        // Invalidate and refetch the execution query to keep React Query in sync
        queryClient.invalidateQueries({
          queryKey: ["trpc", "executions.getOne", { id: executionId }],
        });
      } catch (error) {
        console.error("Failed to parse execution update:", error);
      }
    });

    eventSource.addEventListener("error", () => {
      console.error("Realtime connection error");
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [executionId, queryClient]);

  return execution;
};
