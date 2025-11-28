import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  useSelectedBlock,
  useSelectedDistrict,
  useSelectedState,
} from "@/lib/store";

type GenericDropdownProps = {
  label: string;
  selected: string | null;
  itemKey: string;
  queryKey: string;
  queryFn: () => Promise<any[]>;
  enabled?: boolean;
};

export default function LocationPopover({
  label,
  selected,
  itemKey,
  queryKey,
  queryFn,
  enabled,
}: GenericDropdownProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: [queryKey],
    queryFn: queryFn as () => Promise<any[]>,
    enabled: enabled ?? false,
  });

  const { setSelectedState } = useSelectedState();
  const { setSelectedDistrict } = useSelectedDistrict();
  const { setSelectedBlock } = useSelectedBlock();

  return (
    <Popover onOpenChange={(open) => open && refetch()}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[80px] justify-between font-normal text-xs h-8 p-1 bg-[#006fee] text-white rounded-lg border-none hover:bg-[#006fee]/80 hover:text-white"
        >
          <span className="truncate flex-1 text-left" title={selected || label}>
            {selected || label}
          </span>
          <ChevronDownIcon className="h-3 w-3 flex-shrink-0 ml-1" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[180px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}s...`} />
          <CommandList>
            <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>

            {isLoading ? (
              <CommandItem value="Loading...">Loading {label}s</CommandItem>
            ) : (
              data?.map((item: any, idx: number) => (
                <CommandItem
                  key={idx}
                  value={item[itemKey]}
                  onSelect={() => {
                    if (label === "State") {
                      setSelectedState(item[itemKey]);
                    } else if (label === "District") {
                      setSelectedDistrict(item[itemKey]);
                    } else if (label === "Block") {
                      setSelectedBlock(item[itemKey]);
                    }
                  }}
                >
                  {item[itemKey]}
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
