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

  const testA1 = useMutation(trpc.testA1.mutationOptions({
    onSuccess:()=>{
      toast.success("workflow created");
    },
    onError:()=>{
      toast.error("Something went wrong");
    }
  }
  ));

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
      <Button disabled={testA1.isPending} onClick={()=>testA1.mutate()}>
        test a1
      </Button>
      <Button disabled={create.isPending} onClick={()=>create.mutate()}>
        create workflow
      </Button>
      <LogoutButton />
    </div>
     
  );
};
export default page;