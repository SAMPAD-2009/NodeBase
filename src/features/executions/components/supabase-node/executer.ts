import type { NodeExecuter } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import handlebars from "handlebars";
import { supabaseChannel } from "@/inngest/channels/supabase";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new handlebars.SafeString(jsonString);
    return safeString;
});

type ColumnMapping = {
    column: string;
    value?: string;
}

type SupabaseData = {
    credentialId?: string;
    table?: string;
    mapping?: ColumnMapping[];
    variableName?: string;
};

export const supabaseExecuter: NodeExecuter<SupabaseData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {

    await publish(
        supabaseChannel().status({ nodeId, status: "loading" }),
    );

    if (!data.credentialId || !data.table || !data.mapping) {
        await publish(supabaseChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("credentialId, table and mapping are required");
    }

    // get credential
    const credentialValue = await step.run("get-credential", () => {
        return prisma.credentials.findUniqueOrThrow({
            where: {
                id: data.credentialId,
                userId,
            },
        });
    });

    if (!credentialValue) {
        await publish(supabaseChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("credential not found");
    }

    const decrypted = decrypt(credentialValue.value);
    let parsedCred: { url: string; key: string } | null = null;
    try {
        parsedCred = JSON.parse(decrypt(credentialValue.value));
    } catch (e) {
        await publish(supabaseChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError('Supabase credential must be JSON like { "url": "...", "key": "..." }');
    }

    if (!parsedCred || !parsedCred.url || !parsedCred.key) {
        await publish(supabaseChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError('Supabase credential must include url and key');
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(parsedCred.url, parsedCred.key, { auth: { persistSession: false } });

    // build row from mapping using handlebars
    const row: Record<string, any> = {};

    for (const m of data.mapping) {
        const tpl = handlebars.compile(m.value || "");
        const compiledRaw = tpl(context || {});

        // If the compiled result is an (almost) empty string, treat it as "no value provided" and skip the column.
        // This prevents sending empty strings for auto-increment or numeric columns which causes invalid input errors.
        if (typeof compiledRaw === "string" && compiledRaw.trim() === "") {
            continue;
        }

        // try parse JSON if it's an object literal
        try {
            if (typeof compiledRaw === "string") {
                row[m.column] = JSON.parse(compiledRaw);
            } else {
                row[m.column] = compiledRaw;
            }
        } catch {
            row[m.column] = compiledRaw;
        }
    }

    try {
        // idempotency: if an execution id is present in context and we've already recorded a result for this node,
        // skip re-inserting and return the prior result. This prevents duplicate inserts on retries.
        const executionId = (context as any)?._executionId as string | undefined;
        if (executionId) {
            const existingExec = await prisma.execution.findUnique({ where: { id: executionId }, select: { output: true } });
            const prev = existingExec?.output && (existingExec.output as any).__nodeRuns ? (existingExec.output as any).__nodeRuns[nodeId] : undefined;
            if (prev) {
                await publish(supabaseChannel().status({ nodeId, status: "success" }));
                if (data.variableName) {
                    return {
                        ...context,
                        [data.variableName]: prev,
                    };
                }
                return {
                    ...context,
                    _supabase_inserted: prev,
                };
            }
        }

        const { data: inserted, error } = await supabase
            .from(data.table)
            .insert([row])
            .select('*')
            .limit(1);

        if (error) {
            await publish(supabaseChannel().status({ nodeId, status: "error" }));
            throw error;
        }

        // record the inserted row into the execution output for idempotency
        if (executionId) {
            const existingExec = await prisma.execution.findUnique({ where: { id: executionId }, select: { output: true } });
            const prevOutput = (existingExec?.output as any) || {};
            const nodeRuns = (prevOutput as any).__nodeRuns || {};
            const insertedRow = inserted ? inserted[0] : inserted;
            const newOutput = {
                ...prevOutput,
                __nodeRuns: {
                    ...nodeRuns,
                    [nodeId]: insertedRow,
                },
            };
            try {
                await prisma.execution.update({ where: { id: executionId }, data: { output: newOutput } });
            } catch (e) {
                // non-fatal: log but continue
                // eslint-disable-next-line no-console
                console.error('Failed to update execution output for idempotency', e);
            }
        }

        await publish(supabaseChannel().status({ nodeId, status: "success" }));

        // if variableName set, store inserted row into context under that key
        if (data.variableName) {
            return {
                ...context,
                [data.variableName]: inserted ? inserted[0] : inserted,
            };
        }

        return {
            ...context,
            _supabase_inserted: inserted,
        };

    } catch (error) {
        await publish(supabaseChannel().status({ nodeId, status: "error" }));
        throw error;
    }
};
