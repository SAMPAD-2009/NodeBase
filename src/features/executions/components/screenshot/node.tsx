"use client";

import { BaseExecutionNode } from "../base-execution-node";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { ImageIcon } from "lucide-react";
import { memo, useState } from "react";
import { ScreenshotFormValues, ScreenshotDialog } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { SCREENSHOT_CHANNEL_NAME } from "@/inngest/channels/screenshot";
import { fetchScreenshotRealtimeToken } from "./actions";

type ScreenshotNodeData = {
    variableName?: string;
    url?: string;
    format?: "png" | "jpeg" | "webp";
    fullPage?: boolean;
    width?: number;
    height?: number;
    credentialId?: string;
};

type ScreenshotNodeType = Node<ScreenshotNodeData>;

export const ScreenshotNode = memo((props: NodeProps<ScreenshotNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    const description = nodeData?.url
        ? `${nodeData.url.substring(0, 30)}...`
        : "Not Configured";

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: SCREENSHOT_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchScreenshotRealtimeToken,
    });

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const handleSubmit = (values: ScreenshotFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === props.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            ...values,
                        } as ScreenshotNodeData,
                    };
                }
                return node;
            })
        );
        setDialogOpen(false);
    };

    return (
        <>
            <ScreenshotDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData as Partial<ScreenshotFormValues>}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={ImageIcon}
                name="Screenshot"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

ScreenshotNode.displayName = "ScreenshotNode";
