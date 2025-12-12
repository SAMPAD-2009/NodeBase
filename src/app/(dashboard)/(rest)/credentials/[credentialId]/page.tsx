import { CredentialView } from "@/features/credentals/components/credential";
import { CredentialsError, CredentialsLoading } from "@/features/credentals/components/credentials";
import { prefetchCredential } from "@/features/credentals/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        credentialId: string
    }>
};



const page = async ({ params }: PageProps) => {
    const { credentialId } = await params;
    prefetchCredential(credentialId);
    await requireAuth();
    return (
        <div className="p-4 md:px-10 md:py-6 h-full">
            <div className="mx-auto max-w-3xl w-full flex flex-col gap-y-8 h-full">
                <HydrateClient>
                    <ErrorBoundary fallback={<CredentialsError />}>
                        <Suspense fallback={<CredentialsLoading />}>
                            <CredentialView credentialId={credentialId} />
                        </Suspense>
                    </ErrorBoundary>
                </HydrateClient>
            </div>
        </div>
    )
}
export default page