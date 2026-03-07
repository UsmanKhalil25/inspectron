"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Users, BarChart3, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { MainLogo } from "@/components/ui/main-logo";

import { UserNav } from "./user-nav";

const NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    isActive: true,
  },
  {
    title: "Campaigns",
    url: "/campaigns",
    icon: Target,
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: Users,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentPath = usePathname();

  const isActive = (url: string) => {
    const path = url;
    return currentPath === path;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <MainLogo className="size-8" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Inspectron</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export { AppSidebar };
