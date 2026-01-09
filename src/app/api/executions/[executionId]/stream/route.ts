import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Server-Sent Events endpoint for streaming execution status updates
 * Listens for execution status changes via Prisma (polling) and streams them to the client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
) {
  const { executionId } = await params;
  const auth = await requireAuth();
  const userId = auth.user.id;

  // Verify the user owns this execution
  const execution = await prisma.execution.findUnique({
    where: { id: executionId },
    include: {
      workflow: {
        select: { userId: true },
      },
    },
  });

  if (!execution || execution.workflow.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Set up SSE response
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastStatus = execution.status;
      let pollCount = 0;
      const maxPolls = 600; // 10 minutes with 1 second intervals

      try {
        // Send initial execution state
        controller.enqueue(
          encoder.encode(
            `event: execution-update\ndata: ${JSON.stringify(execution)}\n\n`
          )
        );

        // Poll for execution status changes
        const pollInterval = setInterval(async () => {
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            controller.close();
            return;
          }

          pollCount++;

          try {
            const updatedExecution = await prisma.execution.findUnique({
              where: { id: executionId },
            });

            if (!updatedExecution) {
              clearInterval(pollInterval);
              controller.close();
              return;
            }

            // Only send update if status changed
            if (updatedExecution.status !== lastStatus) {
              lastStatus = updatedExecution.status;
              controller.enqueue(
                encoder.encode(
                  `event: execution-update\ndata: ${JSON.stringify(updatedExecution)}\n\n`
                )
              );

              // Close connection once execution is complete
              if (
                updatedExecution.status === "SUCCESS" ||
                updatedExecution.status === "FAILED"
              ) {
                clearInterval(pollInterval);
                controller.close();
              }
            }
          } catch (error) {
            console.error("Error polling execution status:", error);
            clearInterval(pollInterval);
            controller.close();
          }
        }, 1000); // Poll every 1 second

        // Clean up interval if client disconnects
        request.signal.addEventListener("abort", () => {
          clearInterval(pollInterval);
          controller.close();
        });
      } catch (error) {
        console.error("SSE stream error:", error);
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
