import { SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import {
  useSearch,
  useSelectedBlock,
  useSelectedDateFilter,
  useSelectedDistrict,
  useSelectedState,
} from "@/lib/store";
import { Button } from "../ui/button";
import { useSurveyLocalStorage } from "@/hooks/useFilters";

const SearchBar = () => {
  const { search, setSearch } = useSearch();
  const { selectedState } = useSelectedState();
  const { selectedDistrict } = useSelectedDistrict();
  const { selectedBlock } = useSelectedBlock();
  const { selectedDateFilter } = useSelectedDateFilter();
  const { clearAllFilters } = useSurveyLocalStorage();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 border rounded-md w-64 h-8 p-2 bg-[#f4f4f5] dark:bg-[#11181c]">
        <SearchIcon size={16} />
        <Input
          type="search"
          placeholder="Search for route name"
          className="border-none ring-none shadow-none focus:border-none focus:ring-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {(selectedState ||
        selectedDistrict ||
        selectedBlock ||
        search ||
        selectedDateFilter) && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="h-8 text-xs"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
