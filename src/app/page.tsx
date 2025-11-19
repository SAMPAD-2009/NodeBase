import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { LogoutButton } from "./logout";




const page = async () => {
  await requireAuth();

  const data = await caller.users();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-4">
      Protected home
      <div className="w-full max-w-md">
        {JSON.stringify(data,null,2)}
      </div>
      <LogoutButton />
    </div>
     
  );
};
export default page;