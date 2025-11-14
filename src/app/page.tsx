import { caller } from "@/trpc/server";

const page = async () => {
  const users = await caller.users();
  return (
    <div>
      <p className="min-h-screen min-w-screen flex items-center justify-center">
        {JSON.stringify(users)}
      </p>
    </div>
  );
};
export default page;