import { useEffect } from "react";
import {
  usePage,
  useSearch,
  useSelectedState,
  useSelectedDistrict,
  useSelectedBlock,
  useSelectedDateFilter,
  useDateFrom,
  useDateTo,
} from "@/lib/store";

export function useSurveyLocalStorage() {
  const { page, setPage } = usePage();
  const { search, setSearch } = useSearch();
  const { selectedState, setSelectedState } = useSelectedState();
  const { selectedDistrict, setSelectedDistrict } = useSelectedDistrict();
  const { selectedBlock, setSelectedBlock } = useSelectedBlock();
  const { selectedDateFilter, setSelectedDateFilter } = useSelectedDateFilter();
  const { dateFrom, setDateFrom } = useDateFrom();
  const { dateTo, setDateTo } = useDateTo();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("survey_filters");
      if (!saved) return;

      const data = JSON.parse(saved);

      if (data.search) setSearch(data.search);
      if (data.page) setPage(data.page);
      if (data.state) setSelectedState(data.state);
      if (data.district) setSelectedDistrict(data.district);
      if (data.block) setSelectedBlock(data.block);
      if (data.selectedDateFilter)
        setSelectedDateFilter(data.selectedDateFilter);

      if (data.dateFrom) setDateFrom(new Date(data.dateFrom));
      if (data.dateTo) setDateTo(new Date(data.dateTo));
    } catch (e) {
      console.error("Error reading localStorage", e);
    }
  }, []);

  useEffect(() => {
    const payload = {
      search,
      page,
      state: selectedState,
      district: selectedDistrict,
      block: selectedBlock,
      selectedDateFilter,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
    };

    localStorage.setItem("survey_filters", JSON.stringify(payload));
  }, [
    search,
    page,
    selectedState,
    selectedDistrict,
    selectedBlock,
    selectedDateFilter,
    dateFrom,
    dateTo,
  ]);

  const clearAllFilters = () => {
    localStorage.removeItem("survey_filters");

    setSearch("");
    setPage(1);
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedBlock("");
    setSelectedDateFilter("");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  return { clearAllFilters };
}
