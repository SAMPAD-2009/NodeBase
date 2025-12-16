"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { generateGoogleFormScript } from "./utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
    Open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const GoogleFormTriggerDialog = ({ Open, onOpenChange }: Props) => {
    const params = useParams();
    const workflowId = params.workflowId as string;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = `${baseUrl}/api/workflows/google-form?workflowId=${workflowId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied to clipboard");
        } catch {
            toast.error("Failed to copy webhook URL to clipboard");
        }
    }

    return (
        <Dialog open={Open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Google Form Trigger</DialogTitle>
                    <DialogDescription>
                        Use this webhook URL in your Google Form App Script to trigger this workflow when a form is submitted
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(100vh-220px)]">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="webhook-url" className="pb-2">Webhook URL</Label>
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
                                <li>Open your Google Form.</li>
                                <li>Click on the three dots in the top right corner -→ "Script editor".</li>
                                <li>In the Script editor, paste the following code:</li>
                                <li>Replace "YOUR_WEBHOOK_URL" with the webhook URL you copied earlier.</li>
                                <li>Save and click "Triggers" → "Add trigger".</li>
                                <li>choose: form → on form submit → Save.</li>
                            </ol>
                        </div>

                        <div className="rounded-lg bg-muted p-4 space-y-3">
                            <h4 className="font-medium text-sm">Google Apps Script</h4>
                            <Button type="button" variant="outline" onClick={async () => {
                                const script = generateGoogleFormScript(webhookUrl);
                                try {
                                    await navigator.clipboard.writeText(script);
                                    toast.success("Google Form Script copied to clipboard");
                                } catch {
                                    toast.error("Failed to copy Google Form Script to clipboard");
                                }
                            }}>
                                <CopyIcon className="size-4 mr-2" />
                                Copy Script
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                this contains all the necessary code to trigger this workflow when a form is submitted
                            </p>
                        </div>

                        <div className="rounded-lg bg-muted p-4 space-y-2">
                            <h4 className="font-medium text-sm">Available Variables</h4>
                            <h1 className="text-sm text-muted-foreground space-y-1">
                                <ul>
                                    <li>
                                        <code className="bg-background px-1 py-0.5 rounded">
                                            {"{{googleForm.respondentEmail}}"}
                                        </code>
                                        - Respondent's Email
                                    </li>
                                    <li>
                                        <code className="bg-background px-1 py-0.5 rounded">
                                            {"{{googleForm.responses['Question Name']}}"}
                                        </code>
                                        - Specific answer
                                    </li>
                                    <li>
                                        <code className="bg-background px-1 py-0.5 rounded">
                                            {"{{googleForm.responses}}"}
                                        </code>
                                        - All responses as JSON
                                    </li>
                                </ul>
                            </h1>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )

}