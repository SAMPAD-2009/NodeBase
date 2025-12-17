"use client";

import { BaseExecutionNode } from "../base-execution-node";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { SlackFormValues, SlackDialog } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchSlackRealtimeToken } from "./actions";
import { SLACK_CHANNEL_NAME } from "@/inngest/channels/slack";

type SlackNodeData = {
    webhookUrl?: string;
    content?: string;
    userName?: string;
};

type SlackNodeType = Node<SlackNodeData>;

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    // const description = nodeData?.userPrompt
    //     ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}...`
    //     : "Not Configured";
    const description = nodeData?.content
        ? `${"Send"}: ${nodeData.content.slice(0, 50)}...`
        : "Not Configured";

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: SLACK_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchSlackRealtimeToken
    });

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const handleSubmit = (values: SlackFormValues) => {
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
            <SlackDialog
                Open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/slack.svg"
                name="Slack"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
});

SlackNode.displayName = "SlackNode";
