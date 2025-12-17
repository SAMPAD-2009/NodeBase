"use client";


import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCredentislByType } from "@/features/credentals/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma/enums";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";

const TIMEZONES = [
    "UTC",
    "America/New_York",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Kolkata",
];

const formSchema = z.object({
    cronExpression: z.string().min(1, "Cron expression is required"),
    credentialId: z.string().min(1, "Credential is required"),
    timezone: z.string().min(1, "Timezone is required"),
    workflowId: z.string(),

});

interface Props {
    Open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<CronTriggerFormValues>;
};

export type CronTriggerFormValues = z.infer<typeof formSchema>;

export const CronTriggerDialog = ({
    Open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {

    const {
        data: credentials,
        isLoading: isLoadingCredentials,
    } = useCredentislByType(CredentialType.CRON);

    const params = useParams();
    const workflowId = params.workflowId as string;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = `${baseUrl}/api/workflows/cron?workflowId=${workflowId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied to clipboard");
        } catch {
            toast.error("Failed to copy webhook URL to clipboard");
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            cronExpression: defaultValues.cronExpression || "",
            credentialId: defaultValues.credentialId || "",
            timezone: defaultValues.timezone || "UTC",
            workflowId: workflowId,
        },
    });

    useEffect(() => {
        if (Open) {
            form.reset({
                cronExpression: defaultValues.cronExpression || "",
                credentialId: defaultValues.credentialId || "",
                timezone: defaultValues.timezone || "UTC",
                workflowId: defaultValues.workflowId || workflowId || "",
            })
        }
    }, [Open, defaultValues, form, workflowId]);

    const watchVariableName = form.watch("cronExpression") || "myAPI";
    // const valid = validateCronExpression(watchVariableName);

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    }



    return (
        <Dialog open={Open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cron Trigger</DialogTitle>
                    <DialogDescription>
                        Configure settings for cron trigger node.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(100vh-200px)]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pb-4" id="cron-trigger-form">
                            <FormField
                                control={form.control}
                                name="credentialId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Credential</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a credential" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-64">
                                                    {credentials?.map((options) => (
                                                        <SelectItem key={options.id} value={options.id}>
                                                            <div className="flex items-center gap-2">
                                                                <Image
                                                                    src="/cron.svg"
                                                                    alt="Cron"
                                                                    width={16}
                                                                    height={16}
                                                                />
                                                                {options.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cronExpression"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cron Expression</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 0 0 * * *" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Define the schedule for the cron trigger.
                                            {/* {`${valid}`} */}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="timezone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Timezone</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a timezone" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-64">
                                                    {TIMEZONES.map((tz) => (
                                                        <SelectItem key={tz} value={tz}>
                                                            {tz}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </form>
                    </Form>
                    <div className="rounded-lg bg-muted p-4 ">
                        <h4 className="font-medium text-sm">Supported Cron</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>*/30 * * * *  Every 30 minutes</li>
                            <li>5 * * * *  Every hour</li>
                            <li>5 */2 * * *  Every 2 hours</li>
                            <li>5 0,12 * * *  Twice a day</li>
                            <li>5 7 * * *  Daily at 7 AM</li>
                        </ol>
                    </div>

                    <div className="space-y-2 p-2">
                        <Label htmlFor="webhook-url" className="p-2">You can use the below URL to create custom cron</Label>
                        <div className="flex gap-4">
                            <Input id="webhook-url" value={webhookUrl} readOnly className="font-mono text-sm" />
                            <Button
                                onClick={copyToClipboard}
                                type="button"
                                size="icon"
                                variant="ghost"
                            >
                                <CopyIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                    
                    

                    <div className="rounded-lg bg-muted p-4 ">
                        <h4 className="font-medium text-sm">Set up instructions</h4>
                        <ol className="text-sm text-muted-foreground space -y-1 list-decimal list-inside">
                            <li>Go to https://app.fastcron.com/</li>
                            <li>Create your account</li>
                            <li>Goto your profile --- copy the API</li>
                            <li>Create a new credential</li>
                            <li>Use the above webhook URL as the target URL for your custom cron job</li>
                        </ol>
                    </div>

                    
                </ScrollArea>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button form="cron-trigger-form" type="submit">Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}