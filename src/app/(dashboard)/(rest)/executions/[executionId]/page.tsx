import { requireAuth } from "@/lib/auth-utils";



interface PageProps {
    params: Promise<{
        evecutionId: string
    }>
};

const page=async ({params}:PageProps)=>{
    await requireAuth();
    const {evecutionId}=await params;
    return (
        
            <p> evecutionId: {evecutionId}</p>
        
    )
}
export default page