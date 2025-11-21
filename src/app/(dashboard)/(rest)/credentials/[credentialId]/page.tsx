import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
    params: Promise<{
        credentialId: string
    }>
};



const page=async ({params}:PageProps)=>{
    const {credentialId}=await params;
    await requireAuth();    
    return (
        
            <p> credentialId: {credentialId}</p>
        
    )
}
export default page