"use client";

import { AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle } from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";

interface upgradeModalProps{
    Open:boolean;
    onOpenChange:(open:boolean)=>void;
};

export const UpgradeModal=({Open,onOpenChange}:upgradeModalProps)=>{
    return (
        <AlertDialog open={Open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Upgrade to Pro</AlertDialogTitle>
                    <AlertDialogDescription>
                        Upgrade to Pro to get access to all features.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={()=>{
                        authClient.checkout({slug : "Nodebase-PRO"});
                        onOpenChange(false);
                    }}>Upgrade Now</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}