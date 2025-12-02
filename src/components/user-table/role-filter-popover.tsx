"use client";

import { ChevronDownIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface RoleFilterPopoverProps {
  selectedRole: string;
  roles: string[];
  onRoleChange: (role: string) => void;
}

export function RoleFilterPopover({
  selectedRole,
  roles,
  onRoleChange,
}: RoleFilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[100px] justify-between font-normal text-xs h-8 p-1"
        >
          <span className="truncate flex-1 text-left">
            {selectedRole || "Role"}
          </span>
          <ChevronDownIcon className="h-3 w-3 flex-shrink-0 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search roles..." />
          <CommandList>
            <CommandEmpty>No role found.</CommandEmpty>
            {roles.map((role, idx) => (
              <CommandItem
                key={idx}
                value={role}
                onSelect={() => onRoleChange(role)}
              >
                {role}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
