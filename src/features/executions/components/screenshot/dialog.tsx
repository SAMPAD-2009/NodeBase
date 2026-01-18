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
import { useCredentislByType } from "@/features/credentals/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma/wasm";
import Image from "next/image";

const screenshotFormSchema = z.object({
    variableName: z.string().min(1, "Variable name is required"),
    url: z.string().url("Must be a valid URL"),
    format: z.string(),
    fullPage: z.boolean(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    credentialId: z.string().min(1, { message: "Please select a credential" }),
});

export type ScreenshotFormValues = z.infer<typeof screenshotFormSchema>;

interface ScreenshotDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ScreenshotFormValues) => void;
    defaultValues?: Partial<ScreenshotFormValues>;
}

export const ScreenshotDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: ScreenshotDialogProps) => {
    const {
        data: credentials,
        isLoading: isLoadingCredentials,
    } = useCredentislByType(CredentialType.APIFLASH_KEY);


    const form = useForm<z.infer<typeof screenshotFormSchema>>({
        resolver: zodResolver(screenshotFormSchema),
        defaultValues: {
            variableName: "",
            url: "",
            format: "png",
            fullPage: true,
            width: 1920,
            height: 1080,
            credentialId: "",
            ...defaultValues,
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues?.variableName || "",
                url: defaultValues?.url || "",
                format: defaultValues?.format || "png",
                fullPage: defaultValues?.fullPage !== undefined ? defaultValues.fullPage : true,
                width: defaultValues?.width || 1920,
                height: defaultValues?.height || 1080,
                credentialId: defaultValues?.credentialId || "",
            });
        }
    }, [open, defaultValues, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Configure Screenshot</DialogTitle>
                    <DialogDescription>
                        Capture screenshots of websites
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
                                            placeholder="e.g., page_screenshot"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Name to store the screenshot
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="credentialId"

                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Apiflash API</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoadingCredentials || !credentials?.length}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a credential" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {credentials?.map((options) => (
                                                    <SelectItem key={options.id} value={options.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Image
                                                                src="/apiflash.svg"
                                                                alt="Apiflash"
                                                                width={16}
                                                                height={16}
                                                            />
                                                            {options.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}

                                            </SelectContent>

                                        </Select>
                                        <FormDescription className="text-red-500">
                                            {!credentials?.length && "Please add a Apiflash credential"}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
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
                            name="format"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Format</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="png">PNG</SelectItem>
                                            <SelectItem value="jpeg">JPEG</SelectItem>
                                            <SelectItem value="webp">WebP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Image format for the screenshot
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fullPage"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="mt-0!">Full Page Screenshot</FormLabel>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="width"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Width (px)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="1920"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="height"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Height (px)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="1080"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            Save Configuration
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
