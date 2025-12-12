import { CredentialsContainer, CredentialsError, CredentialsList, CredentialsLoading } from "@/features/credentals/components/credentials";
import { credentialsParamsLoader } from "@/features/credentals/server/params-loader";
import { prefetchCredentials } from "@/features/credentals/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs"
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
    searchParams: Promise<SearchParams>
}

const page = async ({ searchParams }: Props) => {
    await requireAuth();

    const params = await credentialsParamsLoader(searchParams);
    prefetchCredentials(params);

    return (
        <CredentialsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<CredentialsError/>}>
                    <Suspense fallback={<CredentialsLoading/>}>
                        <CredentialsList />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </CredentialsContainer>
    )
}
export default page
