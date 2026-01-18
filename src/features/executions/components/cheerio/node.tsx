"use client";

import { BaseExecutionNode } from "../base-execution-node";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { Code2Icon } from "lucide-react";
import { memo, useState } from "react";
import { CheerioFormValues, CheerioDialog } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { CHEERIO_CHANNEL_NAME } from "@/inngest/channels/cheerio";
import { fetchCheerioRealtimeToken } from "./actions";

type CheerioNodeData = {
    variableName?: string;
    url?: string;
    selector?: string;
    extractAttribute?: string;
    extractMultiple?: boolean;
};

type CheerioNodeType = Node<CheerioNodeData>;

export const CheerioNode = memo((props: NodeProps<CheerioNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    const description = nodeData?.selector
        ? `Extract: ${nodeData.selector}`
        : "Not Configured";

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: CHEERIO_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchCheerioRealtimeToken,
    });

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const handleSubmit = (values: CheerioFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === props.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            ...values,
                        } as CheerioNodeData,
                    };
                }
                return node;
            })
        );
        setDialogOpen(false);
    };

    return (
        <>
            <CheerioDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData as Partial<CheerioFormValues>}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={Code2Icon}
                name="Cheerio Extractor"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

CheerioNode.displayName = "CheerioNode";
