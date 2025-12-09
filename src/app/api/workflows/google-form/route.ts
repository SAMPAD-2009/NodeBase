import { inngest } from "@/inngest/client";
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

        const formData = {
            formId: body.formId,
            formTitle: body.formTitle,
            responseId: body.responseId,
            timestamp: body.timestamp,
            respondentEmail: body.respondentEmail,
            responses: body.responses,
            raw: body,
        }

       await sendWorkflowExecution({
            workflowId,
            initialData:{
                googleForm: formData,
            }
       })

    } catch (error) {
        console.error("Error processing Google Form trigger:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}