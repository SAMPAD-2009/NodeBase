"use client";

import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { LogoutButton } from "./logout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";




const page =   () => {
  // await requireAuth();
  const trpc = useTRPC();
  const {data} = useQuery(trpc.getWorkflows.queryOptions());
  const queryClient = useQueryClient();

  const create =useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess:()=>{
      toast.success("workflow created");
    }
  }));

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-4">
      Protected home
      <div className="w-full max-w-md">
        {JSON.stringify(data,null,2)}
      </div>
      <Button disabled={create.isPending} onClick={()=>create.mutate()}>
        create workflow
      </Button>
      <LogoutButton />
    </div>
     
  );
};
export default page;