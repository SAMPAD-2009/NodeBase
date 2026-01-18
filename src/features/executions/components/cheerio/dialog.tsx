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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";


const cheerioFormSchema = z.object({
    variableName: z.string().min(1, "Variable name is required"),
    url: z.string().url("Must be a valid URL"),
    selector: z.string().min(1, "CSS selector is required"),
    extractAttribute: z.string(),
    extractMultiple: z.boolean(),
});

export type CheerioFormValues = z.infer<typeof cheerioFormSchema>;

interface CheerioDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CheerioFormValues) => void;
    defaultValues?: Partial<CheerioFormValues>;
}

export const CheerioDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: CheerioDialogProps) => {
    const form = useForm({
        resolver: zodResolver(cheerioFormSchema),
        defaultValues: {
            variableName: "",
            url: "",
            selector: "",
            extractAttribute: "text",
            extractMultiple: false,
            ...defaultValues,
        } as CheerioFormValues,
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues?.variableName || "",
                url: defaultValues?.url || "",
                selector: defaultValues?.selector || "",
                extractAttribute: defaultValues?.extractAttribute || "text",
                extractMultiple: defaultValues?.extractMultiple !== undefined ? defaultValues.extractMultiple : false,
            });
        }
    }, [open, defaultValues, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Configure Cheerio Extractor</DialogTitle>
                    <DialogDescription>
                        Extract HTML content using CSS selectors
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., extracted_data"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Name to store the extracted data
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        URL or handlebars template (e.g., {`{{previousOutput.url}}`})
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="selector"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CSS Selector</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="div.title, p.content, a.link"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        CSS selector to find elements
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="extractAttribute"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Extract</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="text">Text Content</SelectItem>
                                            <SelectItem value="html">HTML Content</SelectItem>
                                            <SelectItem value="attr:href">Href Attribute</SelectItem>
                                            <SelectItem value="attr:src">Src Attribute</SelectItem>
                                            <SelectItem value="attr:class">Class Attribute</SelectItem>
                                            <SelectItem value="attr:id">ID Attribute</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        What to extract from selected elements
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="extractMultiple"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="mt-0!">Extract Multiple Elements</FormLabel>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">
                            Save Configuration
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
