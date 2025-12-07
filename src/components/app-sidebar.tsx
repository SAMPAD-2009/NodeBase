"use client";

import { CreditCardIcon, FolderOpenIcon, HistoryIcon, KeyIcon, LampDesk, LogOutIcon, Moon, StarIcon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription";
import { ChangeColor, ModeToggle } from "./theme-toggle";

const menuItems = [
    {
        title: "Main",
        items: [
            {
                title: "workflows",
                icon: FolderOpenIcon,
                href: "/workflows",
            },
            {
                title: "credentials",
                icon: KeyIcon,
                href: "/credentials",
            },
            {
                title: "Executions",
                icon: HistoryIcon,
                href: "/executions",
            }
        ]
    }
];

export const AppSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { hasActiveSubscription, isLoading } = useHasActiveSubscription();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
                        <Link href="/workflows" prefetch>
                            <Image src="/logo.svg" alt="Nodebase" width={30} height={30} />
                            <span className="font-semibold">Nodebase</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
                                            asChild
                                            className="gap-x-4 h-10 px-4"
                                        >
                                            <Link href={item.href} prefetch>
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>

                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>

                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    {!hasActiveSubscription && !isLoading && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Upgrade to PRO"
                                className="gap-x-4 h-10 px-4"
                                onClick={() => authClient.checkout({ slug: "Nodebase-PRO" })}
                            >
                                <StarIcon className="size-4" />
                                <span>Upgrade to PRO</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                        <ModeToggle />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <ChangeColor />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Billing Portal"
                            className="gap-x-4 h-10 px-4"
                            onClick={() => {
                                authClient.customer.portal();
                            }}
                        >
                            <CreditCardIcon className="size-4" />
                            <span>Billing Portal</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Sign Out"
                            className="gap-x-4 h-10 px-4"
                            onClick={() => {
                                authClient.signOut();
                                router.push("/login");
                            }}
                        >
                            <LogOutIcon className="size-4" />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

        </Sidebar>
    )
}