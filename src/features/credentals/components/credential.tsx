"use client";

import Image from "next/image";
import { CredentialType } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { useCreateCredential, useUpdateCredential, useSuspenseCredential } from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
// import { ErrorView, LoadingView } from "@/components/entity-components";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(CredentialType),
    value: z.string().min(1, "Value is required"),
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeoptions = [
    {
        value: CredentialType.OPENAI,
        label: "OpenAI",
        logo: "/openai.svg",
    },
    {
        value: CredentialType.ANTHROPIC,
        label: "Anthropic",
        logo: "/anthropic.svg",
    },
    {
        value: CredentialType.GEMINI,
        label: "Gemini",
        logo: "/gemini.svg",
    },
    {
        value: CredentialType.CRON,
        label: "Cron",
        logo: "/cron.svg",
    },
    {
        value: CredentialType.SUPABASE,
        label: "Supabase",
        logo: "/supabase.svg",
    }
];
export const credentialLogos: Record<CredentialType, string> = {
    [CredentialType.GEMINI]: "/gemini.svg",
    [CredentialType.ANTHROPIC]: "/anthropic.svg",
    [CredentialType.OPENAI]: "/openai.svg",
    [CredentialType.CRON]: "/cron.svg",
    [CredentialType.SUPABASE]: "/supabase.svg"
}

interface credentialFormProps {
    initialData?: {
        id?: string;
        name: string;
        type: CredentialType;
        value: string;
    };
};

export const CredentialForm = ({ initialData }: credentialFormProps) => {
    const router = useRouter();
    const createCredential = useCreateCredential();
    const updateCredential = useUpdateCredential();
    const { handleError, modal } = useUpgradeModal();

    const isEdit = !!initialData?.id;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            type: CredentialType.OPENAI,
            value: "",
        }

    });

    const onSubmit = async (values: FormValues) => {
        if (isEdit && initialData?.id) {
            await updateCredential.mutateAsync({
                id: initialData?.id || "",
                ...values,
            });
        } else {
            await createCredential.mutateAsync(values, {
                onSuccess: (data) => {
                    router.push(`/credentials/${data.id}`);
                },
                onError: (error) => {
                    handleError(error);
                },
            });
        }
    };

    const [isView, setIsView] = useState(false);

    return (
        <>
            {modal}
            <Card className="shadow-none">
                <CardHeader>
                    <CardTitle>
                        {isEdit ? "Edit Credential" : "Create Credential"}
                    </CardTitle>
                    <CardDescription>
                        {isEdit ? "Update your credential details" : "Add a new credential"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="My API" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {credentialTypeoptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            <Image src={option.logo} alt={option.label} width={16} height={16} />
                                                            <span>{option.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Key</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <Input {...field} type={isView ? "text" : "password"} placeholder="****..." />
                                                <Button type="button" variant="outline" onClick={() => setIsView(!isView)}>
                                                    {isView ? (

                                                        <EyeIcon size="4" />

                                                    ) : (
                                                        <EyeOffIcon size="4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-4">
                                <Button type="submit" disabled={createCredential.isPending || updateCredential.isPending} onClick={() =>setIsView(!isView)}>
                                    {isEdit ? "Update" : "Create"}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/credentials" prefetch>
                                        Cancel
                                    </Link>
                                </Button>

                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
};

export const CredentialView = ({ credentialId }: { credentialId: string }) => {

    const { data: credential } = useSuspenseCredential(credentialId);

    return <CredentialForm initialData={credential} />
};