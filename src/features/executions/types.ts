import type { GetStepTools,Inngest } from "inngest";

export type WorkflowContext = Record<string, unknown>;

export type StepTools = GetStepTools<Inngest.Any>;

export interface NodeExecuterParams<TData = Record<string, unknown>> {
    data: TData;
    nodeId: string;
    context: WorkflowContext;
    step: StepTools;
    // pub
}

export type NodeExecuter<TData = Record<string, unknown>> = (params: NodeExecuterParams<TData>) => Promise<WorkflowContext>;



