import { AuthLayout } from "@/features/auth/components/auth-layount"



const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthLayout>
            {children}
        </AuthLayout>
    );
};

export default Layout;