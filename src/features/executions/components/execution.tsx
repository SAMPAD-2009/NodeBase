"use client";

import { ExecutionStatus } from "@/generated/prisma/client";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSuspenseExecution } from "../hooks/use-executions";
import { useRealtimeExecution } from "../hooks/use-realtime-execution";

const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.SUCCESS:
            return <CheckCircle2Icon className="size-5 text-green-600" />;
        case ExecutionStatus.FAILED:
            return <XCircleIcon className="size-5 text-red-600" />;
        case ExecutionStatus.RUNNING:
            return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
        default:
            return <ClockIcon className="size-5 text-muted-foreground" />;
    }
}

const formatStatus = (status: ExecutionStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
};

export const ExecutionView = ({ executionId }: { executionId: string }) => {
    const { data: initialData } = useSuspenseExecution(executionId);
    
    // Subscribe to realtime updates
    const realtimeExecution = useRealtimeExecution(executionId);
    
    // Use realtime status if available, otherwise use initial status
    const status = realtimeExecution?.status || initialData.status;
    const completedAt = realtimeExecution?.completedAt || initialData.completedAt;
    const error = realtimeExecution?.error || initialData.error;
    const errorStack = realtimeExecution?.errorStack || initialData.errorStack;
    const output = realtimeExecution?.output || initialData.output;
    
    const [showStackTrace, setShowStackTrace] = useState(false);
    const duration = completedAt
        ? Math.round((new Date(completedAt).getTime() - initialData.startedAt.getTime()) / 1000)
        : null;
    
    return (
        <Card className="shadow-none">
            <CardHeader>
                <div className="flex items-center gap-3">
                    {getStatusIcon(status)}
                    <div>
                        <CardTitle>
                            {formatStatus(status)}
                        </CardTitle>
                        <CardDescription>
                            Execution for {initialData.workflow.name}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Workflow
                        </p>
                        <Link
                            prefetch
                            className="text-sm hover:underline text-primary"
                            href={`/workflows/${initialData.workflowId}`}
                        >
                            {initialData.workflow.name}
                        </Link>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <p className="text-sm">{formatStatus(status)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Started</p>
                        <p className="text-sm">{formatDistanceToNow(initialData.startedAt, { addSuffix: true })}</p>
                    </div>
                    {completedAt ? (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Completed</p>
                            <p className="text-sm">{formatDistanceToNow(new Date(completedAt), { addSuffix: true })}</p>
                        </div>) : null}
                    {duration !== null ? (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Duration</p>
                            <p className="text-sm">{duration} seconds</p>
                        </div>) : null}

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Inngest Event ID</p>
                        <p className="text-sm">{initialData.inngestEventId}</p>
                    </div>
                </div>
                {error && (
                    <div className="mt-6 p-4 bg-red-50 rounded-md space-y-3">
                        <div>
                            <p className="text-sm font-medium text-red-900 mb-2">Error Message</p>
                            <p className="text-sm text-red-800 font-mono">{error}</p>
                        </div>

                        {errorStack && (
                            <Collapsible open={showStackTrace} onOpenChange={setShowStackTrace}>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-red-900 hover:bg-red-100">
                                        {showStackTrace ? "Hide" : "Show"} Stack Trace
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <pre className="text-xs text-red-800 p-2 mt-2 rounded bg-red-100 overflow-auto">
                                        {errorStack}
                                    </pre>
                                </CollapsibleContent>
                            </Collapsible>
                        )}

                    </div>
                )}

                {output && (
                    <div className="mt-6 p-4 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-2">Output</p>
                        <pre className="text-xs font-mono overflow-auto">
                            {JSON.stringify(output, null, 2)}
                        </pre>
                    </div>
                )}

            </CardContent>

        </Card>
    )
}
