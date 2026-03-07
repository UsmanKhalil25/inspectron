import { ChevronsUpDown } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function UserNavSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="grid flex-1 text-left text-sm leading-tight space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export { UserNavSkeleton };
