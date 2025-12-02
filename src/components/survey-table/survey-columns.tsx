"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BadgeCheckIcon, CalendarIcon, ClockIcon, XIcon } from "lucide-react";
import moment from "moment";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { getRandomAvatarColor, sumTimestamps } from "@/lib/utils";
import ColumnRowAction from "../columns/column-row-action";
import ColumnHoverCard from "../columns/column-hover-card";
import TextTruncate from "../columns/text-truncate";
import ColumnHeader from "../columns/column-header";
import ColumnBadge from "../columns/column-badge";

interface CreateSurveyColumnsParams {
  currentUserRole: string;
}

export function createSurveyColumns({
  currentUserRole,
}: CreateSurveyColumnsParams): ColumnDef<any>[] {
  return [
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => {
        return (
          <ColumnRowAction
            gpsTrackId={row.original.gpsTrackId}
            surveyId={row.original.surveyId}
            routeName={row.original.routeName}
            role={currentUserRole}
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
}
