"use client";
import React, { useEffect, useMemo } from "react";
import { DataTable } from "./data-table";
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
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { BadgeCheckIcon, CalendarIcon, ClockIcon, XIcon } from "lucide-react";
import moment from "moment";
import { Avatar, AvatarFallback } from "../ui/avatar";

import { DateRangePicker } from "../sidebar/date-range-picker";
import { User } from "@/lib/types";
import ColumnRowAction from "../columns/column-row-action";
import { Badge } from "../ui/badge";
import { useSidebar } from "../ui/sidebar";
import TablePagination from "./pagination";
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
import { getRandomAvatarColor, sumTimestamps } from "@/lib/utils";
import ColumnHoverCard from "../columns/column-hover-card";
import TextTruncate from "../columns/text-truncate";
import ColumnHeader from "../columns/column-header";
import ColumnBadge from "../columns/column-badge";
import { useDebounce } from "@/hooks/use-debounce";

export default function SurveyTable({ currentUser }: { currentUser: User }) {
  const queryClient = useQueryClient();
  const { page, setPage } = usePage();
  const { selectedState } = useSelectedState();
  const { selectedDistrict } = useSelectedDistrict();
  const { selectedBlock } = useSelectedBlock();
  const { search } = useSearch();
  const { selectedDateFilter } = useSelectedDateFilter();
  const { dateFrom } = useDateFrom();
  const { dateTo } = useDateTo();
  const { open } = useSidebar();

  useDebounce(search, 500);

  const filters = useMemo(() => {
    const f: any = {
      userRole: currentUser.role,
      userId: currentUser.user_id,
    };

    if (selectedDistrict) f.district = selectedDistrict;
    if (selectedBlock) f.block = selectedBlock;
    if (selectedState) f.state = selectedState;
    if (search) f.routeName = search;
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
    search,
    selectedDateFilter,
    dateFrom,
    dateTo,
  ]);

  const { status, data, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["videos", page, filters],
    queryFn: async () => {
      const data = await getVideoList(filters, page, 10);

      return JSON.parse(data.data).Result;
    },
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const pageSize = 10;
    if (!data || !data[0]) return [];
    const totalPages = Math.ceil(data[0].count / pageSize);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => {
        return (
          <ColumnRowAction
            gpsTrackId={row.original.gpsTrackId}
            surveyId={row.original.surveyId}
            routeName={row.original.routeName}
            role={currentUser.role}
          />
        );
      },
    },
    {
      accessorKey: "route_name",
      header: () => (
        <ColumnHeader header="Route Name" style={{ textAlign: "left" }} />
      ),
      cell: ({ row }) => <ColumnHoverCard row={row} />,
    },
    {
      accessorKey: "entity_name",
      header: "Entity Name",
      cell: ({ row }) => <TextTruncate text={row.original.entityName} />,
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => <TextTruncate text={row.original.state} />,
    },
    {
      accessorKey: "district",
      header: "District",
      cell: ({ row }) => <TextTruncate text={row.original.district} />,
    },
    {
      accessorKey: "block",
      header: "Block",
      cell: ({ row }) => <TextTruncate text={row.original.block} />,
    },
    {
      accessorKey: "ring",
      header: "Ring",
      cell: ({ row }) => <TextTruncate text={row.original.ring} />,
    },
    {
      accessorKey: "child_ring",
      header: "Child Ring",
      cell: ({ row }) => <TextTruncate text={row.original.childRing} />,
    },
    {
      accessorKey: "video_name",
      header: "Video Name",
      cell: ({ row }) => (
        <ColumnBadge
          color={row.original.videoName === "-" ? "error" : "success"}
          icon={row.original.videoName === "-" ? <XIcon size={14} /> : null}
          text={
            row.original.videoName === "-"
              ? "Not Uploaded"
              : row.original.videoName
          }
        />
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => (
        <ColumnBadge
          text={
            row.original.duration > 0
              ? sumTimestamps(row.original.duration)
              : "00:00"
          }
          color="info"
          icon={<ClockIcon size={14} />}
        />
      ),
    },
    {
      accessorKey: "uploaded_on",
      header: "Uploaded On",
      cell: ({ row }) => {
        return (
          <ColumnBadge
            text={moment(row.original.mobileVideoCaptureTime).format(
              "DD MMM YYYY"
            )}
            color="info"
            icon={<CalendarIcon size={14} />}
          />
        );
      },
    },
    {
      accessorKey: "created_on",
      header: "Created On",
      cell: ({ row }) => {
        return (
          <ColumnBadge
            text={moment(row.original.createdOn).format("DD MMM YYYY")}
            color="info"
            icon={<CalendarIcon size={14} />}
          />
        );
      },
    },
    {
      accessorKey: "uploaded_by",
      header: "Uploaded By",
      cell: ({ row }) => {
        const color = getRandomAvatarColor();
        return (
          <div
            className="flex items-center justify-center"
            title={row.original.createdBy}
          >
            <Avatar className="w-6 h-6 text-xs flex items-center justify-center mr-2">
              <AvatarFallback
                className={`${color.bg} ${color.text} font-semibold`}
              >
                {row.original.createdBy.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs w-24 truncate text-center">
              {row.original.createdBy}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return (
          <ColumnBadge
            color={
              row.original.verifiedStatus === "APPROVED" ? "info" : "warning"
            }
            icon={<BadgeCheckIcon size={14} />}
            text={row.original.verifiedStatus}
          />
        );
      },
    },
    {
      accessorKey: "verified_on",
      header: "Verified On",
      cell: ({ row }) => {
        return (
          <ColumnBadge
            color={row.original.verifiedOn ? "info" : "error"}
            icon={<CalendarIcon size={14} />}
            text={
              row.original.verifiedOn
                ? moment(row.original.verifiedOn).format("DD MMM YYYY")
                : "Not Verified"
            }
          />
        );
      },
    },
    {
      accessorKey: "verified_by",
      header: "Verified By",
      cell: ({ row }) => {
        const color = getRandomAvatarColor();
        return (
          <div className="flex items-center justify-center">
            {row.original.verifiedBy ? (
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6 text-xs flex items-center justify-center">
                  <AvatarFallback
                    className={`${color.bg} ${color.text} font-semibold`}
                  >
                    {row.original.verifiedBy.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs">{row.original.verifiedBy}</p>
              </div>
            ) : (
              <Badge className="bg-[#fdd0df] text-[#c20e4d]">
                <XIcon size={14} /> Not Verified
              </Badge>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      className={`container py-6 ${
        open ? "max-w-[1050px]" : "max-w-[1300px]"
      }  mx-auto transition-all duration-300`}
    >
      <div className="mb-4 w-full flex justify-between">
        <SearchBar />

        <div className="flex items-center gap-2 h-8">
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
      />
      <p className="text-sm text-gray-500 mt-1 text-center">
        {data && data.length > 0 ? data[0].count : 0} results found
      </p>
      <TablePagination getPageNumbers={getPageNumbers} />
    </div>
  );
}
