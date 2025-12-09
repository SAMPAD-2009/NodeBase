import { sendWorkflowExecution } from "@/inngest/util";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const workflowId = url.searchParams.get("workflowId");

        if (!workflowId) {
            return NextResponse.json({ success: false, error: "Missing workflowId" }, { status: 400 });
        }

        const body = await request.json();

        const stripeData = {
            eventId: body.Id,
            eventType: body.type,
            timestamp: body.created,
            livemode: body.livemode,
            raw: body.data?.object,
        }

       await sendWorkflowExecution({
            workflowId,
            initialData:{
                stripe: stripeData,
            }
       });
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Error processing Stripe trigger:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}