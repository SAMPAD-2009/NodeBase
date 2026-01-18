"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const mappingSchema = z.object({
    sourceField: z.string().min(1, "Source field is required"),
    newName: z.string().min(1, "New name is required"),
});

const jsonFlattenerFormSchema = z.object({
    variableName: z.string().min(1, "Variable name is required"),
    sourceVariable: z.string().min(1, "Source variable is required"),
    nestingPath: z.string().optional(),
    fieldMappings: z.array(mappingSchema).optional(),
});

export type JsonFlattenerFormValues = z.infer<typeof jsonFlattenerFormSchema>;

interface JsonFlattenerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: JsonFlattenerFormValues) => void;
    defaultValues?: Partial<JsonFlattenerFormValues>;
}

export const JsonFlattenerDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: JsonFlattenerDialogProps) => {
    const [mappings, setMappings] = useState<Array<{ sourceField: string; newName: string }>>(
        defaultValues?.fieldMappings || []
    );
    const [newMapping, setNewMapping] = useState({ sourceField: "", newName: "" });

    const form = useForm({
        resolver: zodResolver(jsonFlattenerFormSchema),
        defaultValues: {
            variableName: "",
            sourceVariable: "",
            nestingPath: "",
            fieldMappings: [],
            ...defaultValues,
        } as JsonFlattenerFormValues,
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues?.variableName || "",
                sourceVariable: defaultValues?.sourceVariable || "",
                nestingPath: defaultValues?.nestingPath || "",
                fieldMappings: defaultValues?.fieldMappings || [],
            });
            setMappings(defaultValues?.fieldMappings || []);
        }
    }, [open, defaultValues, form]);

    const handleAddMapping = () => {
        if (newMapping.sourceField && newMapping.newName) {
            const updatedMappings = [...mappings, newMapping];
            setMappings(updatedMappings);
            form.setValue("fieldMappings", updatedMappings);
            setNewMapping({ sourceField: "", newName: "" });
        }
    };

    const handleRemoveMapping = (index: number) => {
        const updatedMappings = mappings.filter((_, i) => i !== index);
        setMappings(updatedMappings);
        form.setValue("fieldMappings", updatedMappings);
    };

    const handleFormSubmit = (values: JsonFlattenerFormValues) => {
        onSubmit({
            ...values,
            fieldMappings: mappings,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Configure JSON Flattener</DialogTitle>
                    <DialogDescription>
                        Restructure and rename JSON fields
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(100vh-200px)]">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleFormSubmit)}
                            className="space-y-4"
                            id="json-flattener-form"
                        >
                            <FormField
                                control={form.control}
                                name="variableName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Output Variable Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., flattened_data"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Name to store the transformed JSON
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sourceVariable"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source Variable</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., previousOutput"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Variable containing the JSON to transform
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nestingPath"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nesting Path (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., metadata or leave empty for root"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Nest all fields under this key. Leave empty to flatten at root level.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                                <FormLabel>Field Mappings (Optional)</FormLabel>
                                <FormDescription>
                                    Rename fields. If empty, original field names are kept.
                                </FormDescription>

                                <div className="space-y-2">
                                    {mappings.map((mapping, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 text-sm bg-background p-2 rounded border"
                                        >
                                            <span className="flex-1">
                                                <span className="font-mono text-xs">{mapping.sourceField}</span>
                                                <span className="mx-2">→</span>
                                                <span className="font-mono text-xs text-blue-600">{mapping.newName}</span>
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveMapping(index)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Source field name"
                                            value={newMapping.sourceField}
                                            onChange={(e) =>
                                                setNewMapping({
                                                    ...newMapping,
                                                    sourceField: e.target.value,
                                                })
                                            }
                                        />
                                        <Input
                                            placeholder="New field name"
                                            value={newMapping.newName}
                                            onChange={(e) =>
                                                setNewMapping({
                                                    ...newMapping,
                                                    newName: e.target.value,
                                                })
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleAddMapping}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>


                        </form>
                    </Form>
                </ScrollArea>
                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" form="json-flattener-form">Save Configuration</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
