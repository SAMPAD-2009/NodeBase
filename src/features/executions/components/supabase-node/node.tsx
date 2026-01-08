"use client";

import { BaseExecutionNode } from "../base-execution-node";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { SupabaseFormValues, SupabaseDialog} from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchSupabaseRealtimeToken} from "./actions";
import { SUPABASE_CHANNEL_NAME } from "@/inngest/channels/supabase";

type SupabaseNodeData = {
    credentialId?: string;
    table?: string;
    mapping?: Array<{ column: string; value?: string }>;
    variableName?: string;
};

type SupabaseNodeType = Node<SupabaseNodeData>;

export const SupabaseNode = memo((props: NodeProps<SupabaseNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const {setNodes} = useReactFlow();

    const nodeData = props.data;
    // const description = nodeData?.userPrompt
    //     ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}...`
    //     : "Not Configured";
    const description = nodeData?.table
        ? `${nodeData.table}: ${nodeData.mapping ? `${nodeData.mapping.length} columns mapped` : "configured"}`
        : "Not Configured";

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: SUPABASE_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchSupabaseRealtimeToken,
    });
    
    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const handleSubmit = (values: SupabaseFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === props.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            ...values,
                        },
                    };
                }
                return node;
            })
        );
    };

    return (
        <>
            <SupabaseDialog
                Open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/supabase.svg"
                name="Supabase"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
});

SupabaseNode.displayName = "SupabaseNode";
