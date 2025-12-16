"use client";

import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode, useCallback } from "react";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { WorkflowNode } from "@/components/workflow-node";
import { NodeStatusIndicator, type NodeStatus } from "@/components/react-flow/node-status-indicator";

interface BaseTriggerNodeProps extends NodeProps {
    icon: LucideIcon | string;
    name: string;
    description?: string;
    children?: ReactNode;
    status?: NodeStatus;
    onSettings?: () => void;
    onDoubleClick?: () => void;
    /** Optional function to run before deletion. If provided it will be awaited; the internal delete will always run afterward. */
    onBeforeDelete?: () => void | Promise<void>;
}

export const BaseTriggerNode = memo(
    ({
        id,
        icon: Icon,
        name,
        description,
        children,
        onSettings,
        onDoubleClick,
        status = "initial",
        onBeforeDelete,
    }: BaseTriggerNodeProps) => {

        const { setNodes, setEdges } = useReactFlow();

        const handleDelete = useCallback(() => {
            setNodes((currentNodes) => {
                const updateNodes = currentNodes.filter((node) => node.id !== id);
                return updateNodes;
            });

            setEdges((currentEdges) => {
                const updateEdges = currentEdges.filter(
                    (edge) => edge.source !== id && edge.target !== id
                );
                return updateEdges;
            });
        }, [id, setNodes, setEdges]);

        // Run optional `onBeforeDelete` (awaiting if it returns a promise), but
        // always perform the internal delete afterwards. Keep this stable with `useCallback`.
        const resolvedOnDelete = useCallback(() => {
            (async () => {
                try {
                    if (onBeforeDelete) await onBeforeDelete();
                } catch (err) {
                    // Don't prevent deletion if the pre-delete hook fails
                    // eslint-disable-next-line no-console
                    console.error("onBeforeDelete failed:", err);
                } finally {
                    handleDelete();
                }
            })();
        }, [handleDelete, onBeforeDelete]);

        return (
            <WorkflowNode
                name={name}
                description={description}
                onDelete={resolvedOnDelete}
                onSettings={onSettings}
            >
                <NodeStatusIndicator
                    status={status}
                    variant="border"
                    className="rounded-l-2xl"
                >
                    <BaseNode status={status} onDoubleClick={onDoubleClick} className="rounded-l-2xl relative-group">
                        <BaseNodeContent>
                            {typeof Icon === "string" ? (
                                <Image
                                    src={Icon}
                                    alt={name}
                                    width={16}
                                    height={16}
                                />
                            ) : (
                                <Icon className="size-4 text-muted-foreground" />
                            )}
                            {children}
                            <BaseHandle
                                id="source-1"
                                type="source"
                                position={Position.Right}
                            />
                        </BaseNodeContent>

                    </BaseNode>
                </NodeStatusIndicator>
            </WorkflowNode>
        );
    });

BaseTriggerNode.displayName = "BaseTriggerNode";

