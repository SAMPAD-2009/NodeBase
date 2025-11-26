import { PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import React from "react";
import { Input } from "./ui/input";


type EntityHeaderProps = {
    title: string;
    description?: string;
    newButtonLabel?: string;
    disabled?: boolean;
    isCreating?: boolean;
} & (
        | { onNew: () => void; newButtonHref?: never }
        | { newButtonHref: string; onNew?: never }
        | { onNew?: never; newButtonHref?: never }
    )


export const EntityHeader = ({
    title,
    description,
    newButtonLabel,
    disabled,
    isCreating,
    onNew,
    newButtonHref,
}: EntityHeaderProps) => {
    return (
        <div className="flex flex-row items-ceneter justify-between gap-x-4">
            <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
                {description && (
                    <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
                )}

            </div>
            {onNew && !newButtonHref && (
                <Button
                    onClick={onNew}
                    disabled={disabled || isCreating}
                    size="sm"
                >
                    <PlusIcon className="size-4" />
                    {newButtonLabel || "Create"}
                </Button>
            )}
            {newButtonHref && !onNew && (
                <Button
                    asChild
                    size="sm"
                >
                    <Link href={newButtonHref} prefetch>
                        <PlusIcon className="size-4" />
                        {newButtonLabel || "Create"}
                    </Link>
                </Button>
            )}
        </div>

    );
};

type EntityContainerProps = {
    children: React.ReactNode;
    header?: React.ReactNode;
    search?: React.ReactNode;
    pagination?: React.ReactNode;
};

export const EntityContainer = ({
    children,
    header,
    search,
    pagination,
}: EntityContainerProps) => {
    return (
        <div className="p-4 md:px-10 md:py-6 h-full">
            <div className="mx-auto max-h-screen-xl w-full flex flex-col gap-y-8 h-full">
                {header}

                <div className="flex flex-col gap-y-4 h-full">
                    {search}
                    {children}
                </div>
                {pagination}
            </div>
        </div>
    )
};

interface EntitySearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};


export const EntitySearch = ({
    value,
    onChange,
    placeholder = "Search",
}: EntitySearchProps) => {
    return (
        <div className="relative ml-auto">
            <SearchIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="max-w-[200px] bg-background shadow-none border-border pl-8"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};

interface EntityPaginationProps {
    page: number,
    totalPages: number,
    onPageChange: (page: number) => void,
    disabled?: boolean,
};

export const EntityPagination = ({
    page,
    totalPages,
    onPageChange,
    disabled,
}: EntityPaginationProps) => {
    return (
        <div className="flex items-center justify-between gap-x-2 w-full">
            <div className="flex-1 text-sm text-muted-foreground">
                Page {page} of {totalPages || 1}
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1 || disabled}
                    variant={"outline"}
                    size="sm"
                >
                    Previous
                </Button>
                <Button
                    onClick={() => onPageChange(Math.min(totalPages || 1, page + 1))}
                    disabled={page === totalPages || totalPages === 0 || disabled}
                    variant={"outline"}
                    size="sm"
                >
                    Next
                </Button>
            </div>
        </div>
    )
}

