import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { StripeTriggerDialog } from "./dialog";
import { fetchStripeTriggerRealtimeToken } from "./actions";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { STRIPE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/stripe-trigger";


export const StripeTriggerNode = memo((props:NodeProps)=>{

    const [DialogOpen,setDialogOpen] = useState(false);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: STRIPE_TRIGGER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchStripeTriggerRealtimeToken,
    });

    
    const handleOpenSettings = () =>{
        setDialogOpen(true);
    }

    return (
        <>
        <StripeTriggerDialog Open={DialogOpen} onOpenChange={setDialogOpen} />
        <BaseTriggerNode 
        {...props}
        icon="/stripe.svg"
        name="Stripe Trigger"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        />
        </>
    )
});

