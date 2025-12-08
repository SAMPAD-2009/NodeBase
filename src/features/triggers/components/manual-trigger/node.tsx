import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
import { fetchManualTriggerRealtimeToken } from "./actions";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { MANUAL_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/manual-trigger";


export const ManualTriggerNode = memo((props:NodeProps)=>{

    const [DialogOpen,setDialogOpen] = useState(false);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: MANUAL_TRIGGER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchManualTriggerRealtimeToken,
    });
    
    const handleOpenSettings = () =>{
        setDialogOpen(true);
    }

    return (
        <>
        <ManualTriggerDialog Open={DialogOpen} onOpenChange={setDialogOpen} />
        <BaseTriggerNode 
        {...props}
        icon={MousePointerIcon}
        name="when clicking 'execute workflow'"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        />
        </>
    )
});

