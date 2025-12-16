import { NodeProps, Node, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { CronTriggerDialog, CronTriggerFormValues } from "./dialog";
import { fetchCronTriggerRealtimeToken } from "./actions";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { CRON_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/cron";
import { createorupdatecron, removeCron } from "./croner";

type CronTriggerNodeData = {
    credentialId: string;
    cronExpression: string;
    timezone?: string;
    workflowId?: string;
};

type CronTriggerNodeType = Node<CronTriggerNodeData>;

export const CronTriggerNode = memo((props: NodeProps<CronTriggerNodeType>) => {

    const [DialogOpen, setDialogOpen] = useState(false);

    const nodeData = props.data;

    const { setNodes } = useReactFlow();


    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: CRON_TRIGGER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchCronTriggerRealtimeToken,
    });

    const handleOpenSettings = () => {
        setDialogOpen(true);
    }

    

    

    const handleSubmit = async (values: CronTriggerFormValues) => {
        try {
            await createorupdatecron({ cronExpression: values.cronExpression, credentialId: values.credentialId, workflowId: values.workflowId, timezone: values.timezone }, props.id);
        } catch (err) {
            // Log the error but continue to persist the node data locally
            // eslint-disable-next-line no-console
            console.error("createorupdatecron failed:", err);
        }

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
            <CronTriggerDialog Open={DialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSubmit} defaultValues={nodeData}/>
            <BaseTriggerNode
                {...props}
                id ={props.id}
                icon="/cron.svg"
                name="Cron Trigger"
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
                onBeforeDelete={async () => {
                    try {
                        if (nodeData?.credentialId && nodeData?.workflowId) {
                            await removeCron({ credentialId: nodeData.credentialId, workflowId: nodeData.workflowId });
                        }
                    } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error("removeCron on delete failed:", err);
                    }
                }}
            />
        </>
    )
});

CronTriggerNode.displayName = "CronTriggerNode";

