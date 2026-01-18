"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCredentislByType } from "@/features/credentals/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma/client";
import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const formSchema = z.object({
    credentialId: z.string().min(1, { message: "Please select a credential" }),
    table: z.string().min(1, { message: "Please select a table" }),
    // mapping: array of { column: string, value: string }
    mapping: z.array(z.object({ column: z.string(), value: z.string().optional() })),
    // optional: name to write outputs back into context
    variableName: z.string().optional(),
});

export type SupabaseFormValues = z.infer<typeof formSchema>;

interface Props {
    Open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: SupabaseFormValues) => void;
    defaultValues?: Partial<SupabaseFormValues>;
};

export const SupabaseDialog = ({
    Open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const trpc = useTRPC();

    const {
        data: credentials,
        isLoading: isLoadingCredentials,
    } = useCredentislByType(CredentialType.SUPABASE);

    const form = useForm<SupabaseFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            credentialId: defaultValues.credentialId || "",
            table: defaultValues.table || "",
            mapping: defaultValues.mapping || [],
            variableName: defaultValues.variableName || "",
        },
    });

    const [tables, setTables] = useState<string[]>([]);
    const [columns, setColumns] = useState<Array<{ name: string; type: string }>>([]);

    useEffect(() => {
        if (Open) {
            form.reset({
                credentialId: defaultValues.credentialId || "",
                table: defaultValues.table || "",
                mapping: defaultValues.mapping || [],
                variableName: defaultValues.variableName || "",
            });
        }
    }, [Open, defaultValues, form]);

    const credentialId = form.watch("credentialId");
    const table = form.watch("table");

    // fetch tables and columns imperatively using the queryClient and guard for missing inputs
    const queryClient = useQueryClient();

    useEffect(() => {
        let mounted = true;
        if (!credentialId) {
            setTables([]);
            return;
        }
        const cid = credentialId!;
        const q = trpc.executions.listTables.queryOptions({ credentialId: cid } as any);
        void queryClient.fetchQuery(q)
            .then((t: any) => mounted && setTables(t))
            .catch((err) => {
                // surface server error so we can debug invalid credentials or permission issues
                // keep UI stable by setting empty tables
                // eslint-disable-next-line no-console
                console.error("listTables error", err);
                toast.error("Failed to fetch tables: " + (err?.message || "unknown"));
                mounted && setTables([]);
            });
        return () => { mounted = false; };
    }, [credentialId, queryClient, trpc]);

    useEffect(() => {
        let mounted = true;
        if (!credentialId || !table) {
            setColumns([]);
            form.setValue("mapping", []);
            return;
        }
        const cid = credentialId!;
        const tname = table!;
        const q = trpc.executions.listColumns.queryOptions({ credentialId: cid, table: tname } as any);
        void queryClient.fetchQuery(q)
            .then((cols: any) => {
                if (!mounted) return;
                setColumns(cols);
                const current = form.getValues("mapping") || [];
                const seeded = cols.map((c: any) => {
                    const existing = current.find((x) => x.column === c.name);
                    return existing || { column: c.name, value: "" };
                });
                form.setValue("mapping", seeded);
            })
            .catch((err) => {
                // eslint-disable-next-line no-console
                console.error("listColumns error", err);
                toast.error("Failed to fetch table columns: " + (err?.message || "unknown"));
                mounted && setColumns([]);
            });
        return () => { mounted = false; };
    }, [credentialId, table, queryClient, trpc, form]);

    const handleSubmit = (values: SupabaseFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={Open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Supabase Node</DialogTitle>
                    <DialogDescription>
                        Insert data into your Supabase table.use dynamic or static values
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(100vh-220px)]">
                    <div className="rounded-lg bg-muted p-4 text-sm">
                        <strong>Note:</strong> Copy the SQL with the button below and run it in supabase SQL editor for the first and only time.
                        <Button size="sm" onClick={async () => {
                            const sql = `-- Create helper function to list tables in public schema\nCREATE OR REPLACE FUNCTION nodebase_list_tables() RETURNS TABLE(table_name text) LANGUAGE SQL STABLE AS $$\n  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;\n$$;\n\n-- Create helper function to list columns for a table\nCREATE OR REPLACE FUNCTION nodebase_list_columns(table_name text) RETURNS TABLE(name text, data_type text) LANGUAGE SQL STABLE AS $$\n  SELECT column_name AS name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position;\n$$;\n`;
                            try {
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                    await navigator.clipboard.writeText(sql);
                                    toast.success('SQL copied to clipboard — paste it into the Supabase SQL editor');
                                }
                            } catch (err) {
                                toast.error('Could not copy SQL to clipboard');
                            }
                        }} variant="link">Copy SQL for SQL editor</Button>
                    </div>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className={`space-y-6 mt-4 `}
                            id="supabase-node-dialog-form"
                        >
                            <FormField
                                control={form.control}
                                name="credentialId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supabase Credential</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCredentials || !credentials?.length}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a credential" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {credentials?.map((c) => (
                                                        <SelectItem key={c.id} value={c.id}>
                                                            <div className="flex items-center gap-2">
                                                                <Image src="/supabase.svg" alt="Supabase" width={16} height={16} />
                                                                {c.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>{!credentials?.length && "Please add a Supabase credential (as JSON {\"url\": \"...\", \"key\": \"...\"})"}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="table"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Table</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!tables.length}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a table" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tables.map((t) => (
                                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>Select the table to insert into. Columns will be discovered automatically.</FormDescription>
                                        {credentialId && !tables.length && !isLoadingCredentials && (
                                            <>
                                                <FormDescription className="text-destructive">No tables found — please ensure the credential value is valid JSON with{'{ "url": "...", "key": "..." }'} and has permission to list tables.</FormDescription>
                                                <div className="flex gap-2 mt-2">
                                                    <Button size="sm" onClick={async () => {
                                                        // retry discovery
                                                        const cid = credentialId!;
                                                        const q = trpc.executions.listTables.queryOptions({ credentialId: cid } as any);
                                                        try {
                                                            const t: any = await queryClient.fetchQuery(q);
                                                            setTables(t || []);
                                                            toast.success('Refreshed tables');
                                                        } catch (err: any) {
                                                            toast.error('Retry failed: ' + (err?.message || 'unknown'));
                                                            setTables([]);
                                                        }
                                                    }}>Retry</Button>
                                                </div>
                                            </>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="w-full">
                                <div className="mb-2">
                                    <strong>Column mapping</strong>
                                    <div className="text-sm text-muted-foreground">For each column, provide a static value or a handlebars expression (e.g. <code>{'{{prevNode.someField}}'}</code>).</div>
                                </div>
                                {columns.map((col) => (
                                    <div key={col.name} className="flex w-full">
                                        <div className="col-span-5 w-full p-1">
                                            <FormField

                                                control={form.control}
                                                name="mapping"
                                                render={() => {
                                                    const current = (form.getValues("mapping") || []).find((m) => m.column === col.name) || { column: col.name, value: "" };
                                                    return (
                                                        <FormItem>
                                                            <FormLabel>{col.name} <span className="text-xs text-muted-foreground">({col.type})</span></FormLabel>
                                                            <FormControl>
                                                                <Textarea value={current.value} onChange={(e) => {
                                                                    const all = form.getValues("mapping") || [];
                                                                    const updated = all.map((m) => m.column === col.name ? { ...m, value: e.target.value } : m);
                                                                    form.setValue("mapping", updated);
                                                                }} placeholder={`{{myPrevNode.${col.name}}} or static value`} className="w-full font-mono text-sm min-h-[40px]" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}

                            </div>

                            <FormField control={form.control} name="variableName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable name (optional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="store result as {{myVar}}" />
                                    </FormControl>
                                    <FormDescription>Optional name to store output back into execution context.</FormDescription>
                                </FormItem>
                            )} />

                        </form>
                    </Form>
                </ScrollArea>

                <DialogFooter className="mt-2">
                    <Button type="submit" form="supabase-node-dialog-form" className="w-full">Save</Button>
                </DialogFooter>

            </DialogContent>

        </Dialog>
    );
};