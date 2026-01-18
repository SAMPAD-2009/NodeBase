"use client";

import { BaseExecutionNode } from "../base-execution-node";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GitMergeIcon } from "lucide-react";
import { memo, useState } from "react";
import { JsonFlattenerFormValues, JsonFlattenerDialog } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { JSON_FLATTENER_CHANNEL_NAME } from "@/inngest/channels/json-flattener";
import { fetchJsonFlattenerRealtimeToken } from "./actions";

type JsonFlattenerNodeData = {
    variableName?: string;
    sourceVariable?: string;
    nestingPath?: string;
    fieldMappings?: Array<{ sourceField: string; newName: string }>;
};

type JsonFlattenerNodeType = Node<JsonFlattenerNodeData>;

export const JsonFlattenerNode = memo((props: NodeProps<JsonFlattenerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    const description = nodeData?.sourceVariable
        ? `Transform: ${nodeData.sourceVariable}`
        : "Not Configured";

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: JSON_FLATTENER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchJsonFlattenerRealtimeToken,
    });

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const handleSubmit = (values: JsonFlattenerFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === props.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            ...values,
                        } as JsonFlattenerNodeData,
                    };
                }
                return node;
            })
        );
        setDialogOpen(false);
    };

    return (
        <>
            <JsonFlattenerDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData as Partial<JsonFlattenerFormValues>}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={GitMergeIcon}
                name="JSON Flattener"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    );
});

JsonFlattenerNode.displayName = "JsonFlattenerNode";
