interface PageProps {
    params: Promise<{
        workflowId: string
    }>
};

import { requireAuth } from "@/lib/auth-utils";

const page=async ({params}:PageProps)=>{
    await requireAuth();
    const {workflowId}=await params;
    return (
        
            <p> workflowId: {workflowId}</p>
        
    )
}
export default page;