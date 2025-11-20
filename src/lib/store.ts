import { create } from "zustand";

interface SurveyState {
  page: number;
  setPage: (page: number) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedBlock: string;
  setSelectedBlock: (block: string) => void;
  search: string;
  setSearch: (search: string) => void;
  selectedDateFilter: string;
  setSelectedDateFilter: (dateFilter: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (dateFrom: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (dateTo: Date | undefined) => void;
}

export const useSurveyStore = create<SurveyState>()((set) => ({
  page: 1,
  setPage: (page) => set({ page }),
  selectedState: "",
  setSelectedState: (state) => set({ selectedState: state }),
  selectedDistrict: "",
  setSelectedDistrict: (district) => set({ selectedDistrict: district }),
  selectedBlock: "",
  setSelectedBlock: (block) => set({ selectedBlock: block }),
  search: "",
  setSearch: (search) => set({ search }),
  selectedDateFilter: "",
  setSelectedDateFilter: (dateFilter) =>
    set({ selectedDateFilter: dateFilter }),
  dateFrom: undefined,
  setDateFrom: (dateFrom) => set({ dateFrom }),
  dateTo: undefined,
  setDateTo: (dateTo) => set({ dateTo }),
}));

export const usePage = () => {
  const page = useSurveyStore((state) => state.page);
  const setPage = useSurveyStore((state) => state.setPage);

  return { page, setPage };
};

export const useSelectedState = () => {
  const selectedState = useSurveyStore((state) => state.selectedState);
  const setSelectedState = useSurveyStore((state) => state.setSelectedState);
  return { selectedState, setSelectedState };
};

export const useSelectedDistrict = () => {
  const selectedDistrict = useSurveyStore((state) => state.selectedDistrict);
  const setSelectedDistrict = useSurveyStore(
    (state) => state.setSelectedDistrict
  );
  return { selectedDistrict, setSelectedDistrict };
};

export const useSelectedBlock = () => {
  const selectedBlock = useSurveyStore((state) => state.selectedBlock);
  const setSelectedBlock = useSurveyStore((state) => state.setSelectedBlock);
  return { selectedBlock, setSelectedBlock };
};

export const useSearch = () => {
  const search = useSurveyStore((state) => state.search);
  const setSearch = useSurveyStore((state) => state.setSearch);
  return { search, setSearch };
};

export const useSelectedDateFilter = () => {
  const selectedDateFilter = useSurveyStore(
    (state) => state.selectedDateFilter
  );
  const setSelectedDateFilter = useSurveyStore(
    (state) => state.setSelectedDateFilter
  );
  return { selectedDateFilter, setSelectedDateFilter };
};

export const useDateFrom = () => {
  const dateFrom = useSurveyStore((state) => state.dateFrom);
  const setDateFrom = useSurveyStore((state) => state.setDateFrom);
  return { dateFrom, setDateFrom };
};

export const useDateTo = () => {
  const dateTo = useSurveyStore((state) => state.dateTo);
  const setDateTo = useSurveyStore((state) => state.setDateTo);
  return { dateTo, setDateTo };
};
