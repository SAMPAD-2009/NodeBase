"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// export const AVAILABLE_MODELS = [
//     "gemini-2.5-flash",
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
    model: z.string().min(1, { message: "Please select a model" }),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, { message: "User prompt is required" }),

});

interface Props {
    Open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<AnthropicFormValues>;
};

export type AnthropicFormValues = z.infer<typeof formSchema>;

export const AnthropicDialog = ({
    Open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            // model: defaultValues.model || AVAILABLE_MODELS[0],
            model: defaultValues.model || "claude-3.5-sonnet",
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || "",
        },
    });

    useEffect(() => {
        if (Open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                // model: defaultValues.model || AVAILABLE_MODELS[0],
                model: defaultValues.model || "claude-3.5-sonnet",
                systemPrompt: defaultValues.systemPrompt || "",
                userPrompt: defaultValues.userPrompt || "",
            })
        }
    }, [Open, defaultValues, form]);

    const watchVariableName = form.watch("variableName") || "myAnthropic";

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    }

    return (
        <Dialog open={Open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Anthropic Node</DialogTitle>   
                    <DialogDescription>
                        Configure the AI model and prompts for this node
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
                            {/* <FormField
                                control={form.control}
                                name="model"

                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Model</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a model" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {AVAILABLE_MODELS.map((model) => (
                                                        <SelectItem key={model} value={model}>
                                                            {model}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>

                                            </Select>
                                            <FormDescription>
                                                sets the behavior and tone of the assistant.use {"{{variableName}}"} to reference the variable name.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            /> */}
                            <FormField
                                control={form.control}
                                name="systemPrompt"

                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>System Prompt (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    className="w-full min-h-[80px] font-mono text-sm"
                                                    placeholder="You are a helpful assistant."
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                sets the behavior and tone of the assistant.use {"{{variableName}}"} to reference the variable name.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                            <FormField
                                control={form.control}
                                name="userPrompt"

                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>User Prompt</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    className="w-full min-h-[120px] font-mono text-sm"
                                                    placeholder="summarise the text {{json.data}}"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Prompt to send to the ai.use {"{{variableName}}"} to reference the variable name.
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