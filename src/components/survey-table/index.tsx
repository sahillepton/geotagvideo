"use client";
import React, { useEffect, useMemo } from "react";
import { DataTable } from "../table/data-table";
import {
  getBlocks,
  getDistricts,
  getStates,
  getVideoList,
} from "../sidebar/action";

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DateRangePicker } from "../sidebar/date-range-picker";
import { User } from "@/lib/types";
import { useSidebar } from "../ui/sidebar";
import { TablePagination } from "../table/pagination";
import ToggleColumns from "./toggle-columns";
import LocationPopover from "./location-popover";
import SearchBar from "./search-bar";
import {
  useDateFrom,
  useDateTo,
  usePage,
  useSearch,
  useSelectedBlock,
  useSelectedDateFilter,
  useSelectedDistrict,
  useSelectedState,
} from "@/lib/store";
import DownloadDialog from "./download-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSurveyColumns } from "./survey-columns";
import ReplaceTrack from "./replace-track";

export default function SurveyTable({ currentUser }: { currentUser: User }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { page, setPage } = usePage();
  const { selectedState } = useSelectedState();
  const { selectedDistrict } = useSelectedDistrict();
  const { selectedBlock } = useSelectedBlock();
  const { search } = useSearch();
  const { selectedDateFilter } = useSelectedDateFilter();
  const { dateFrom } = useDateFrom();
  const { dateTo } = useDateTo();
  const { open } = useSidebar();

  const debouncedSearch = useDebounce(search, 500);

  const filters = useMemo(() => {
    const f: any = {
      userRole: currentUser.role,
      userId: currentUser.user_id,
    };

    if (selectedDistrict) f.district = selectedDistrict;
    if (selectedBlock) f.block = selectedBlock;
    if (selectedState) f.state = selectedState;
    if (debouncedSearch) f.routeName = debouncedSearch;
    if (selectedDateFilter) f.dateKey = selectedDateFilter;
    if (dateFrom) f.dateFrom = dateFrom.toISOString().split("T")[0];
    if (dateTo) f.dateTo = dateTo.toISOString().split("T")[0];

    return f;
  }, [
    currentUser.role,
    currentUser.user_id,
    selectedState,
    selectedDistrict,
    selectedBlock,
    debouncedSearch,
    selectedDateFilter,
    dateFrom,
    dateTo,
  ]);

  const { data, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["videos", page, filters],
    queryFn: async () => {
      const data = await getVideoList(filters, page, 10);

      return JSON.parse(data.data).Result;
    },
    placeholderData: keepPreviousData,
  });

  const pageSize = 10;
  const totalPages = data && data[0] ? Math.ceil(data[0].count / pageSize) : 0;

  useEffect(() => {
    if (!isPlaceholderData && data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ["videos", page + 1, filters],
        queryFn: () => getVideoList(filters, page + 1, 10),
      });
    }
  }, [data, isPlaceholderData, page, queryClient, filters]);

  useEffect(() => {
    const hasCompleteDateFilter = selectedDateFilter && dateFrom && dateTo;
    const hasNonDateFilters =
      selectedState || selectedDistrict || selectedBlock || search;
    if (hasCompleteDateFilter || hasNonDateFilters) {
      setPage(1);
      queryClient.prefetchQuery({
        queryKey: ["videos", 1, filters],
        queryFn: async () => {
          const data = await getVideoList(filters, 1, 10);
          return JSON.parse(data.data).Result;
        },
      });
    }
  }, [
    filters,
    queryClient,
    selectedDateFilter,
    dateFrom,
    dateTo,
    selectedState,
    selectedDistrict,
    selectedBlock,
    search,
  ]);

  const columns = createSurveyColumns({
    currentUserRole: currentUser.role,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={`container py-6 transition-all duration-300`}>
      <div className="mb-4 w-full flex justify-between">
        <SearchBar />

        <div className="flex items-center gap-2 h-8">
          <ReplaceTrack />
          <DownloadDialog currentUser={currentUser} />

          <ToggleColumns table={table} />

          <LocationPopover
            label="State"
            selected={selectedState}
            queryKey="states"
            queryFn={getStates}
            itemKey="st_name"
          />

          <LocationPopover
            label="District"
            selected={selectedDistrict}
            queryKey="districts"
            queryFn={getDistricts}
            itemKey="dt_name"
          />

          <LocationPopover
            label="Block"
            selected={selectedBlock}
            queryKey="blocks"
            queryFn={getBlocks}
            itemKey="blk_name"
          />

          <DateRangePicker />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        isFetching={isFetching}
        table={table}
        onRowClick={(row) => {
          router.push(`/video/${row.surveyId}`);
          toast.success("Redirecting to video player");
        }}
      />
      <p className="text-sm text-gray-500 mt-1 text-center">
        {data && data.length > 0 ? data[0].count : 0} results found
      </p>
      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
