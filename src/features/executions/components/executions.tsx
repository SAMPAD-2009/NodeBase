"use client";

import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import type { Execution } from "@/generated/prisma/client";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";


export const ExecutionsList = () => {
    // throw new Error("WorkflowsList not implemented");

    const executions = useSuspenseExecutions();

    return (
        <EntityList
            items={executions.data.items}
            getKey={(execution) => execution.id}
            renderItem={(execution) => <ExecutionItem data={execution} />}
            emptyView={<ExecutionsEmpty />}
        />
    )
};

export const ExecutionsHeader = () => {

    return (
        <EntityHeader
            title="Executions"
            description="Create and Manage your Executions"
        />
    );
};

export const ExecutionsPagination = () => {

    const executions = useSuspenseExecutions();
    const [params, setParams] = useExecutionsParams();

    return (
        <EntityPagination
            disabled={executions.isFetching}
            totalPages={executions.data.totalPages}
            page={executions.data.page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    );
};

export const ExecutionsContainer = ({ children }: { children: React.ReactNode }) => {

    return (
        <EntityContainer
            header={<ExecutionsHeader />}
            pagination={<ExecutionsPagination />}
        >
            {children}
        </EntityContainer>
    )
}

export const ExecutionsLoading = () => {
    return (
        <LoadingView message="Loading Executions..." />
    );
};

export const ExecutionsError = () => {
    return (
        <ErrorView message="Error loading Executions ... " />
    );
};

export const ExecutionsEmpty = () => {
    return (
        <EmptyView
            message="No Executions found.
                Get started by executing one."
        />
    );
};

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
}



export const ExecutionItem = ({
    data
}: { data: Execution & { workflow: { id: string , name: string } } }) => {
    const duration = data.completedAt
        ? Math.round((data.completedAt.getTime() - data.startedAt.getTime()) / 1000)
        : null;

    const subTitle =(
        <>
        {data.workflow.name} • Started {formatDistanceToNow(data.startedAt, { addSuffix: true })}{
            duration ? ` • Took: ${duration}s` : ''
        }
        </>
    )

    return (
        <EntityItem
            href={`/executions/${data.id}`}
            title={formatStatus(data.status)}
            subtitle={subTitle}
            image={
                <div className="size-8 flex items-center justify-center">
                    {getStatusIcon(data.status)}
                </div>
            }
        />
    )
}