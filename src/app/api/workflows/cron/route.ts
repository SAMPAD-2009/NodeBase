import { sendWorkflowExecution } from "@/inngest/util";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const workflowId = url.searchParams.get("workflowId");

        if (!workflowId) {
            return NextResponse.json({ success: false, error: "Missing workflowId" }, { status: 400 });
        }

       await sendWorkflowExecution({
            workflowId
       })
       return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Error processing cron trigger:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}