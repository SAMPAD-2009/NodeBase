"use server";

import prisma from "@/lib/db";




export async function createorupdatecron(data: { cronExpression: string; credentialId: string; workflowId: string; timezone?: string }, id?: string) {
    const credentialValue = await prisma.credentials.findUniqueOrThrow({
        where: {
            id: data.credentialId,
        },
    });

    const baseUrl = process.env.NGROK_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/workflows/cron?workflowId=${data.workflowId}`;

    if (!credentialValue) {
        throw new Error("Credential not found");
    }

    const url = "https://app.fastcron.com/api/v1/cron_list?token=" + credentialValue.value;

    const dataReturned = await fetch(url);

    if (!dataReturned.ok) {
        throw new Error(`Failed to fetch cron list: ${dataReturned.status} ${dataReturned.statusText}`);
    }

    const jsonData = await dataReturned.json();
    // Validate shape and look for a cron entry whose `name` exactly matches workflowId
    const entries = Array.isArray(jsonData?.data) ? jsonData.data : [];

    const matching = entries.find((item: any) => {
        const name = item?.name;
        return typeof name === "string" && name === data.workflowId;
    }) || null;

    if (matching) {
        // Update existing cron job (include timezone if provided)
        const updateUrl = `https://app.fastcron.com/api/v1/cron_edit?token=${credentialValue.value}&id=${matching.id}&expression=${data.cronExpression}${data.timezone ? `&timezone=${data.timezone}` : ""}`;
        const updateResponse = await fetch(updateUrl, { method: "POST" });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update cron job: ${updateResponse.status} ${updateResponse.statusText}`);
        }
    } else {
        // Create new cron job (include timezone if provided)
        const createUrl = `https://app.fastcron.com/api/v1/cron_add?token=${credentialValue.value}&timezone=${data.timezone || "UTC"}&name=${data.workflowId}&expression=${data.cronExpression}&url=${webhookUrl}`;
        const createResponse = await fetch(createUrl, { method: "POST" });
        console.log(createUrl);

        if (!createResponse.ok) {
            throw new Error(`Failed to create cron job: ${createResponse.status} ${createResponse.statusText}`);
        }
    }
}

export async function removeCron(data: { credentialId: string; workflowId: string }) {
    try {
        const credentialValue = await prisma.credentials.findUniqueOrThrow({
            where: { id: data.credentialId },
        });

        const url = "https://app.fastcron.com/api/v1/cron_list?token=" + credentialValue.value;
        const dataReturned = await fetch(url);

        if (!dataReturned.ok) {
            // Log and return early if we can't list crons
            // eslint-disable-next-line no-console
            console.error(`Failed to fetch cron list: ${dataReturned.status} ${dataReturned.statusText}`);
            return;
        }

        const jsonData = await dataReturned.json();
        const entries = Array.isArray(jsonData?.data) ? jsonData.data : [];

        const matching = entries.find((item: any) => {
            const name = item?.name;
            return typeof name === "string" && name === data.workflowId;
        }) || null;

        if (!matching) {
            // nothing to remove
            return;
        }

        // Try known delete endpoints; be tolerant to different API names

        const delURL = `https://app.fastcron.com/api/v1/cron_delete?token=${credentialValue.value}&id=${matching.id}`;


        let deleted = false;

        const resp = await fetch(delURL, { method: "POST" });
        if (resp.ok) {
            deleted = true;
        }

        if (!deleted) {
            // eslint-disable-next-line no-console
            console.error(`Failed to delete cron for workflow ${data.workflowId}`);
        }
    } catch (err) {
        // Log but don't rethrow to avoid blocking node deletion
        // eslint-disable-next-line no-console
        console.error("removeCron failed:", err);
    }
}


