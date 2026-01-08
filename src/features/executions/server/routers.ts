import { PAGINATION } from "@/config/constraints";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";




export const executionsRouter = createTRPCRouter({
    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return prisma.execution.findUniqueOrThrow({
                where: {
                    workflow: { userId: ctx.auth.user.id },
                    id: input.id
                },
                include: {
                    workflow: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            });

        }),

    getMany: protectedProcedure
        .input(
            z.object({
                page: z.number().default(PAGINATION.DEFAULT_PAGE),
                pageSize: z.number()
                    .min(PAGINATION.MIN_PAGE_SIZE)
                    .max(PAGINATION.MAX_PAGE_SIZE)
                    .default(PAGINATION.DEFAULT_PAGE_SIZE),
            })
        )
        .query(async ({ ctx, input }) => {
            const { page, pageSize } = input;

            const [items, totalCount] = await Promise.all([
                prisma.execution.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        workflow: { userId: ctx.auth.user.id },
                    },
                    orderBy: {
                        startedAt: "desc",
                    },
                    include: {
                        workflow: {
                            select: {
                                id: true,
                                name: true,
                            },
                        }
                    },
                }),
                prisma.execution.count({
                    where: {
                        workflow: { userId: ctx.auth.user.id },
                    },
                }),
            ])
            const totalPages = Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                items,
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            };
        }),

    // Supabase helpers used by the editor UI
    listTables: protectedProcedure
        .input(z.object({ credentialId: z.string() }))
        .query(async ({ ctx, input }) => {
            const credential = await prisma.credentials.findUniqueOrThrow({
                where: { id: input.credentialId, userId: ctx.auth.user.id },
            });

            const { decrypt } = await import('@/lib/encryption');
            const credValue = decrypt(credential.value);
           

            // credValue is expected to be JSON like { "url": "https://..", "key": ".." }
            let parsed;
            try {
                parsed = JSON.parse(credValue);
            } catch {
                throw new Error('Supabase credential must be a JSON string containing { url, key }');
            }
            

            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(parsed.url, parsed.key, { auth: { persistSession: false } });

            // First try RPC helper functions (preferred). These functions can be created in the
            // Supabase SQL editor. If they are missing, fall back to querying information_schema.
            try {
                const rpc = await supabase.rpc('nodebase_list_tables');
                if (!rpc.error && Array.isArray(rpc.data) && rpc.data.length) {
                    const t0 = rpc.data[0];
                    const tablesFromRpc = typeof t0 === 'string' ? rpc.data as string[] : (rpc.data as any[]).map((r: any) => r.table_name || r.table || Object.values(r)[0]);
                    const tables = (tablesFromRpc || []).filter(Boolean);
                    if (tables.length) return tables;
                }
            } catch (e: any) {
                console.log('RPC nodebase_list_tables failed:', e?.message || e);
                // fallthrough to fallback
            }

            // Fallback: try information_schema (may be restricted by PostgREST/Supabase API)
            const { data, error } = await supabase
                .from('"information_schema"."tables"')
                .select('table_name')
                .eq('table_schema', 'public');

            if (error) throw new Error(`Failed to list tables (RPC and information_schema both failed). If you don't have the helper RPCs installed, run the SQL shown in the UI to create the functions 'nodebase_list_tables' and 'nodebase_list_columns'. Underlying error: ${error.message}`);

            const tables = (data || []).map((r: any) => r.table_name).filter(Boolean);

            return tables;
        }),

    listColumns: protectedProcedure
        .input(z.object({ credentialId: z.string(), table: z.string() }))
        .query(async ({ ctx, input }) => {
            const credential = await prisma.credentials.findUniqueOrThrow({
                where: { id: input.credentialId, userId: ctx.auth.user.id },
            });

            const { decrypt } = await import('@/lib/encryption');
            const credValue = decrypt(credential.value);

            let parsed;
            try {
                parsed = JSON.parse(credValue);
            } catch {
                throw new Error('Supabase credential must be a JSON string containing { url, key }');
            }

            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(parsed.url, parsed.key, { auth: { persistSession: false } });

            // Try RPC first
            try {
                const rpc = await supabase.rpc('nodebase_list_columns', { table_name: input.table });
                if (!rpc.error && Array.isArray(rpc.data) && rpc.data.length) {
                    const colsFromRpc = (rpc.data as any[]).map((r: any) => ({ name: r.name || r.column_name || Object.values(r)[0], type: r.data_type || r.data_type || r.type || '' }));
                    const cols = colsFromRpc.map(c => ({ name: c.name, type: c.type || '' }));
                    if (cols.length) return cols;
                }
            } catch (e: any) {
                console.log('RPC nodebase_list_columns failed:', e?.message || e);
                // fall through to fallback
            }

            const { data, error } = await supabase
                .from('"information_schema"."columns"')
                .select('column_name,data_type')
                .eq('table_schema', 'public')
                .eq('table_name', input.table);

            if (error) throw new Error(`Failed to list columns for table ${input.table} (RPC and information_schema both failed). Run the SQL shown in the UI to create the helper function 'nodebase_list_columns'. Underlying error: ${error.message}`);

            const cols = (data || []).map((r: any) => ({ name: r.column_name, type: r.data_type }));

            return cols;
        }),
});

