import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";
import { fetchGoogleFormTriggerRealtimeToken } from "./actions";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { GOOGLE_FORM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/google-form-trigger";


export const GoogleFormTrigger = memo((props:NodeProps)=>{

    const [DialogOpen,setDialogOpen] = useState(false);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: GOOGLE_FORM_TRIGGER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchGoogleFormTriggerRealtimeToken,
    });

    
    const handleOpenSettings = () =>{
        setDialogOpen(true);
    }

    return (
        <>
        <GoogleFormTriggerDialog Open={DialogOpen} onOpenChange={setDialogOpen} />
        <BaseTriggerNode 
        {...props}
        icon="/googleform.svg"
        name="Google Form"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        />
        </>
    )
});

