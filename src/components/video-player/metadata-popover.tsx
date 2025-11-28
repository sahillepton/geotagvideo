"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

const MetadataPopover = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="absolute top-2 left-2 z-[9999] h-8 w-8 shadow-lg rounded-lg border border-neutral-200 bg-white/70 backdrop-blur-md hover:bg-white/90"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
        >
          <MenuIcon size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        className="p-3 opacity-60 hover:opacity-100 transition-opacity duration-200 hover:shadow-md"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default MetadataPopover;
