import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";


export const ManualTriggerNode = memo((props:NodeProps)=>{

    const [DialogOpen,setDialogOpen] = useState(false);

    const nodeStatus = "initial";
    
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

