import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppSidebar } from "./components/app-sidebar";
import { UserProvider } from "../providers/user-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center gap-2 px-4">
              <div className="flex w-full justify-between items-center">
                <SidebarTrigger className="-ml-1" />
                <ModeToggle />
              </div>
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
