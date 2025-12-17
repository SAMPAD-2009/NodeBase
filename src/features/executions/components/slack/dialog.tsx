"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// export const AVAILABLE_MODELS = [
//     "",
//     "gemini-1.5-flash-8b",
//     "gemini-1.5-pro",
//     "gemini-1.0-pro",
//     "gemini-pro",
// ] as const;

const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, { message: "Variable name must start with a letter, underscore, or dollar sign, followed by any number of letters, numbers, underscores, or dollar signs" }),
    content: z.string().min(1, { message: "Content is required" }).max(2000, { message: "Content must be less than 2000 characters" }),
    webhookUrl: z.string().min(1, { message: "Webhook URL is required" }),
});

interface Props {
    Open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<SlackFormValues>;
};

export type SlackFormValues = z.infer<typeof formSchema>;

export const SlackDialog = ({
    Open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            content: defaultValues.content || "",
            webhookUrl: defaultValues.webhookUrl || "",
        },
    });

    useEffect(() => {
        if (Open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                content: defaultValues.content || "",
                webhookUrl: defaultValues.webhookUrl || "",
            })
        }
    }, [Open, defaultValues, form]);

    const watchVariableName = form.watch("variableName") || "mySlack";

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    }

    return (
        <Dialog open={Open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Slack Node</DialogTitle>
                    <DialogDescription>
                        Configure the Slack node to send messages to your Slack channel via webhook.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(100vh-220px)]">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className={`space-y-8 mt-4 `}
                            id="http-request-dialog-form"
                        >
                            <FormField
                                control={form.control}
                                name="variableName"
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Variable Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className="w-full"
                                                    placeholder="myAPI"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Use this name to reference the variable in other nodes.{" "}
                                                {`{{${watchVariableName}.aiResponse}}`}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                            <FormField
                                control={form.control}
                                name="webhookUrl"

                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Webhook URL</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="https://hooks.slack.com/services/..."
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                The Slack webhook URL to send messages to.
                                            </FormDescription>
                                            <FormDescription>
                                                Make sure the "key" is "content"                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                            <FormField
                                control={form.control}
                                name="content"

                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    className="w-full min-h-[80px] font-mono text-sm"
                                                    placeholder="Summary : {{aiResponse}}"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                The message content to send to the Slack channel.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                        </form>
                    </Form>
                </ScrollArea>
                <DialogFooter className="mt-4">
                    <Button type="submit" form="http-request-dialog-form">Save</Button>
                </DialogFooter>

            </DialogContent>

        </Dialog>
    )

}