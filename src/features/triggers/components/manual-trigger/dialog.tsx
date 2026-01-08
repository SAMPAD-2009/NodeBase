"use client";

import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription } from "@/components/ui/dialog";

interface Props {
    Open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const ManualTriggerDialog = ({Open,onOpenChange}:Props) =>{
    return (
        <Dialog open={Open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manual Trigger</DialogTitle>
                    <DialogDescription>
                        No config available for manual node.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">Used to manually trigger a workflow.</p>
                </div>
            </DialogContent>
        </Dialog>
    )

}