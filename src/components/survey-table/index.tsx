"use client";
import React, { useEffect, useMemo, useState } from "react";
import { DataTable } from "./data-table";
import {
  getBlocks,
  getDistricts,
  getStates,
  getVideoList,
  getVideoList2,
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
import {
  BadgeCheckIcon,
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  RouteIcon,
  XIcon,
} from "lucide-react";
import moment from "moment";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";

import { DateRangePicker } from "../sidebar/date-range-picker";
import { User } from "@/lib/types";
import RowAction from "./row-action";
import { Badge } from "../ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import Link from "next/link";
import { useSidebar } from "../ui/sidebar";
import { handleDownloadGeoJSON } from "@/lib/utils";
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

const avatarColors = [
  { bg: "bg-green-200", text: "text-green-800" },
  { bg: "bg-blue-200", text: "text-blue-800" },
  { bg: "bg-red-200", text: "text-red-800" },
  { bg: "bg-yellow-200", text: "text-yellow-800" },
  { bg: "bg-purple-200", text: "text-purple-800" },
  { bg: "bg-pink-200", text: "text-pink-800" },
  { bg: "bg-indigo-200", text: "text-indigo-800" },
];

const getRandomAvatarColor = () => {
  const randomIndex = Math.floor(Math.random() * avatarColors.length);
  return avatarColors[randomIndex];
};

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

  useEffect(() => {
    const timer = setTimeout(() => {}, 500); // 500ms debounce delay

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const getFilters = () => {
    const filters: any = {};
    filters.userRole = currentUser.role;
    filters.userId = currentUser.user_id;
    if (selectedDistrict) {
      filters.district = selectedDistrict;
    }
    if (selectedBlock) {
      filters.block = selectedBlock;
    }
    if (selectedState) {
      filters.state = selectedState;
    }
    if (search) {
      filters.routeName = search;
    }
    if (selectedDateFilter) {
      filters.dateKey = selectedDateFilter;
    }
    if (dateFrom) {
      filters.dateFrom = dateFrom.toISOString().split("T")[0];
    }
    if (dateTo) {
      filters.dateTo = dateTo.toISOString().split("T")[0];
    }
    return filters;
  };

  const filters = useMemo(
    () => getFilters(),
    [
      selectedState,
      selectedDistrict,
      selectedBlock,
      search,
      selectedDateFilter,
      dateFrom,
      dateTo,
    ]
  );

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

    // Calculate total pages based on count and page size
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

  function sumTimestamps(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // console.log(minutes, "minutes");
    //console.log(seconds, "seconds");

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => {
        return (
          <RowAction
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
        <span className="!text-left" style={{ textAlign: "left" }}>
          Route Name
        </span>
      ),
      cell: ({ row }) => (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="text-left">
              {row.original.routeName}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex gap-4 items-center">
              <div className="bg-black text-white rounded-full p-2 w-10 h-10 flex items-center justify-center">
                <RouteIcon size={20} />
              </div>
              <div className="space-y-1">
                <Link
                  href={`/video/${row.original.surveyId}`}
                  className="text-sm font-semibold hover:underline"
                >
                  {row.original.routeName}
                </Link>
                <div className="flex gap-2">
                  <Badge variant={"secondary"}>{row.original.state}</Badge>
                  <Badge variant={"secondary"}>{row.original.district}</Badge>
                  <Badge variant={"secondary"}>{row.original.block}</Badge>
                </div>
                <div className="text-muted-foreground text-xs">
                  {moment(row.original.mobileVideoCaptureTime).format(
                    "DD MMM YYYY"
                  )}
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ),
    },
    {
      accessorKey: "entity_name",
      header: "Entity Name",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <span
            title={row.original.entityName}
            className="w-20 text-center text-xs font-semibold  truncate rounded pl-1 pr-1 text-[#11181c] dark:text-white"
          >
            {row.original.entityName.length > 20
              ? row.original.entityName.slice(0, 20) + "..."
              : row.original.entityName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <span
            title={row.original.state}
            className="w-20 text-center text-xs font-semibold truncate rounded px-1 py-0.5 text-[#11181c] dark:text-white"
          >
            {row.original.state.length > 20
              ? row.original.state.slice(0, 20) + "..."
              : row.original.state}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "district",
      header: "District",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <span
            title={row.original.district}
            className="w-20 text-center text-xs font-semibold  truncate  rounded px-1 py-0.5 text-[#11181c] dark:text-white"
          >
            {row.original.district.length > 20
              ? row.original.district.slice(0, 20) + "..."
              : row.original.district}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "block",
      header: "Block",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <span
            title={row.original.block}
            className="w-20 text-center text-xs font-semibold  truncate  rounded px-1 py-0.5 text-[#11181c] dark:text-white"
          >
            {row.original.block.length > 20
              ? row.original.block.slice(0, 20) + "..."
              : row.original.block}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "ring",
      header: "Ring",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <span className="w-20 text-center text-xs font-semibold  truncate  rounded px-1 py-0.5 text-[#11181c] dark:text-white">
            {row.original.ring.length > 20
              ? row.original.ring.slice(0, 20) + "..."
              : row.original.ring}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "child_ring",
      header: "Child Ring",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <span className="w-20 text-center text-xs font-semibold  truncate  rounded px-1 py-0.5 text-[#11181c] dark:text-white">
            {row.original.childRing.length > 20
              ? row.original.childRing.slice(0, 20) + "..."
              : row.original.childRing}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "video_name",
      header: "Video Name",
      cell: ({ row }) => (
        <Badge
          className={`text-xs flex items-center ${
            row.original.videoName === "-"
              ? "bg-[#fdd0df] text-[#c20e4d]"
              : "bg-[#d1f4e0] text-[#419967]"
          }`}
        >
          {row.original.videoName === "-" ? (
            <span className="flex items-center gap-1">
              {" "}
              <XIcon size={14} /> Not Uploaded
            </span>
          ) : (
            row.original.videoName
          )}
        </Badge>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => (
        <Badge variant={"secondary"}>
          {row.original.duration > 0 ? (
            <>
              <ClockIcon size={14} className="ml-1" />
              {sumTimestamps(row.original.duration)}
            </>
          ) : (
            "00:00"
          )}
        </Badge>
      ),
    },
    {
      accessorKey: "uploaded_on",
      header: "Uploaded On",
      cell: ({ row }) => {
        const date = moment(row.original.mobileVideoCaptureTime).format(
          "DD MMM YYYY"
        );
        const time = moment(row.original.mobileVideoCaptureTime).format(
          "hh:mm:ss A"
        );
        return (
          <Badge variant={"secondary"}>
            <CalendarIcon size={14} />
            <span>{date}</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_on",
      header: "Created On",
      cell: ({ row }) => {
        const date = moment(row.original.createdOn).format("DD MMM YYYY");
        return (
          <Badge variant={"secondary"}>
            <CalendarIcon size={14} />
            <span>{date}</span>
          </Badge>
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
          <Badge
            variant="secondary"
            className={`${
              row.original.verifiedStates === "APPROVED"
                ? "bg-blue-500 dark:bg-blue-600"
                : "bg-orange-500 dark:bg-orange-600"
            }  text-xs text-white`}
          >
            <BadgeCheckIcon size={14} />
            {row.original.verifiedStatus === "APPROVED"
              ? "APPROVED"
              : "PENDING"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "verified_on",
      header: "Verified On",
      cell: ({ row }) => {
        return (
          <Badge className="bg-[#fdd0df] text-[#c20e4d]">
            <CalendarIcon size={14} />
            <span>
              {row.original.verifiedOn
                ? moment(row.original.verifiedOn).format("DD MMM YYYY")
                : "Not Verified"}
            </span>
          </Badge>
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
          {/* <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={async () => {
              for (const survey of data) {
                await handleDownloadGeoJSON(survey.gpsTrackId);
              }
            }}
          >
            <DownloadIcon size={14} />
          </Button> */}

          <DownloadDialog />

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
