"use client";

import { BaseExecutionNode } from "../base-execution-node";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { OpenaiDialog, OpenaiFormValues } from "./dialog";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai";
import { fetchOpenaiRealtimeToken } from "./actions";

type OpenaiNodeData = {
    credentialId?: string;
    variableName?: string;
    model?: string;
    systemPrompt?:string;
    userPrompt?:string;
};

type OpenaiNodeType = Node<OpenaiNodeData>;

export const OpenaiNode = memo((props: NodeProps<OpenaiNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const {setNodes} = useReactFlow();

    const nodeData = props.data;
    // const description = nodeData?.userPrompt
    //     ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}...`
    //     : "Not Configured";
    const description = nodeData?.userPrompt
        ? `${nodeData.model || "gpt-4.1-mini"}: ${nodeData.userPrompt.slice(0, 50)}...`
        : "Not Configured";

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: OPENAI_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchOpenaiRealtimeToken,
    });
    
    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const handleSubmit = (values: OpenaiFormValues) => {
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
            <OpenaiDialog
                Open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/openai.svg"
                name="Openai"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
});

OpenaiNode.displayName = "OpenaiNode";
