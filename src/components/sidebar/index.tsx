"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  UserIcon,
  VideoIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { User } from "@/lib/types";
import { usePathname } from "next/navigation";
import { useSurveyStore } from "@/lib/store";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import Link from "next/link";

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User;
}) {
  const pathname = usePathname();
  const breadcrumbItems = pathname.split("/").filter((item) => item !== "");

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Geo Tagged Video</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <Collapsible asChild defaultOpen={true}>
          <SidebarGroup>
            <SidebarGroupLabel> Recordings</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    tooltip="Geotagged Videos"
                    isActive={
                      breadcrumbItems[0] === "geotaggedvideos" ||
                      breadcrumbItems[0] === "video"
                    }
                  >
                    <a href={`/geotaggedvideos`}>
                      <VideoIcon className="size-4" />
                      <span>Geotagged Videos</span>
                    </a>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {/* <CollapsibleContent>
                  <SidebarMenuSub>
                    {surveys.map((survey) => (
                      <SidebarMenuSubItem key={survey.id}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={surveyId === survey.id}
                        >
                          <Link href={`/video/${survey.id}`}>
                            <span>{survey.name}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent> */}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </Collapsible>
        <SidebarGroup>
          <SidebarGroupLabel> Configuration Manager</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="User Management"
                isActive={breadcrumbItems[0] === "user-management"}
              >
                <Link href="/user-management">
                  <UserIcon className="size-4" />
                  <span>User Management</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
