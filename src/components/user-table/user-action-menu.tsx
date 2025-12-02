"use client";

import { MoreHorizontalIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import EditUserModel from "./edit-user-model";
import DeleteUserModal from "./delete-user-modal";

interface UserActionMenuProps {
  user: any;
  currentUser: any;
  data: any;
}

export function UserActionMenu({
  user,
  currentUser,
  data,
}: UserActionMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontalIcon className="w-4 h-4 transition-colors group-hover:text-accent-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex flex-col gap-1 p-2 w-56 rounded-xl shadow-lg"
      >
        <EditUserModel currentUser={currentUser} data={data} user={user} />
        <DeleteUserModal deletingUser={user} />
      </PopoverContent>
    </Popover>
  );
}
