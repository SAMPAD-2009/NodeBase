"use client";

import { BaseExecutionNode } from "../base-execution-node";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { DiscordFormValues, DiscordDialog} from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchDiscordRealtimeToken,} from "./actions";
import { DISCORD_CHANNEL_NAME } from "@/inngest/channels/discord";

type DiscordNodeData = {
    webhookUrl?: string;
    content?: string;
    userName?: string;
};

type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const {setNodes} = useReactFlow();

    const nodeData = props.data;
    // const description = nodeData?.userPrompt
    //     ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}...`
    //     : "Not Configured";
    const description = nodeData?.content
        ? `${"Send"}: ${nodeData.content.slice(0, 50)}...`
        : "Not Configured";

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: DISCORD_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchDiscordRealtimeToken,
    });
    
    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const handleSubmit = (values: DiscordFormValues) => {
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
            <DiscordDialog
                Open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/discord.svg"
                name="Discord"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
});

DiscordNode.displayName = "DiscordNode";
