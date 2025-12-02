"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface UserSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  placeholder?: string;
}

export function UserSearchBar({
  search,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
  placeholder = "Search for username or email",
}: UserSearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 border rounded-md w-64 h-8 p-2 bg-[#f4f4f5] dark:bg-[#11181c]">
        <SearchIcon size={16} />
        <Input
          type="search"
          placeholder={placeholder}
          className="border-none ring-none shadow-none focus:border-none focus:ring-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="h-8 text-xs"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
