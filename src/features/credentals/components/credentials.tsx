"use client";

import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useRemoveCredential, useSuspenseCredentials } from "../hooks/use-credentials";
import { useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/use-credential-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { type Credentials } from "@/generated/prisma/client";
import { formatDistanceToNow } from "date-fns";
import { credentialLogos } from "./credential";
import Image from "next/image";


export const CredentialsSearch = () => {

    const [params, setParams] = useCredentialsParams();
    const { searchValue, onSearchChange } = useEntitySearch({ params, setParams });


    return (
        <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search Credentials"
        />
    )
}


export const CredentialsList = () => {
    // throw new Error("WorkflowsList not implemented");

    const credentals = useSuspenseCredentials();

    return (
        <EntityList
            items={credentals.data.items}
            getKey={(credential) => credential.id}
            renderItem={(credential) => <CredentialItem data={credential} />}
            emptyView={<CredentialsEmpty />}
        />
    )
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {

    return (
        <EntityHeader
            title="Credentials"
            description="Create and Manage your Credentials"
            newButtonLabel="Create Credential"
            disabled={disabled}
            newButtonHref="/credentials/new"
        />
    );
};

export const CredentialsPagination = () => {

    const credentials = useSuspenseCredentials();
    const [params, setParams] = useCredentialsParams();

    return (
        <EntityPagination
            disabled={credentials.isFetching}
            totalPages={credentials.data.totalPages}
            page={credentials.data.page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    );
};

export const CredentialsContainer = ({ children }: { children: React.ReactNode }) => {

    return (
        <EntityContainer
            header={<CredentialsHeader />}
            search={<CredentialsSearch />}
            pagination={<CredentialsPagination />}
        >
            {children}
        </EntityContainer>
    )
}

export const CredentialsLoading = () => {
    return (
        <LoadingView message="Loading Credentials..." />
    );
};

export const CredentialsError = () => {
    return (
        <ErrorView message="Error loading Credentials ... " />
    );
};

export const CredentialsEmpty = () => {
    const router = useRouter();

    const handleCreate = () => {
        router.push(`/credentials/new`);
    }

    return (
        <EmptyView
            message="No Credentials found.
                Get started by creating one."
            onNew={handleCreate} />
    );
};



export const CredentialItem = ({
    data,
}: { data: Credentials }) => {
    const removeCredential = useRemoveCredential();
    const handleRemove = () => {
        removeCredential.mutate({ id: data.id });
    }
    const Logo = credentialLogos[data.type] || "🔑";


    return (
        <EntityItem
            href={`/credentials/${data.id}`}
            title={data.name}
            subtitle={
                <>
                    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
                    &bull; Created{" "}
                    {formatDistanceToNow(data.createdAt, { addSuffix: true })}
                </>
            }
            image={
                <div className="size-8 flex items-center justify-center">
                    <Image src={Logo} alt={data.type} width={20} height={20} />
                </div>
            }
            onRemove={handleRemove}
            isRemoving={removeCredential.isPending}
        />
    )
}