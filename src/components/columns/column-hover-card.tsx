import { RouteIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import Link from "next/link";
import { Badge } from "../ui/badge";
import moment from "moment";
import { Row } from "@tanstack/react-table";

const ColumnHoverCard = ({ row }: { row: Row<any> }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" className="text-left">
          {row.original.routeName}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 max-w-[calc(100vw-2rem)]">
        <div className="flex gap-4 items-start">
          <div className="bg-black text-white rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0">
            <RouteIcon size={20} />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <Link
              href={`/video/${row.original.surveyId}`}
              className="text-sm font-semibold hover:underline break-words line-clamp-2"
            >
              {row.original.routeName}
            </Link>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={"secondary"} className="truncate max-w-full">
                {row.original.state}
              </Badge>
              <Badge variant={"secondary"} className="truncate max-w-full">
                {row.original.district}
              </Badge>
              <Badge variant={"secondary"} className="truncate max-w-full">
                {row.original.block}
              </Badge>
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
  );
};

export default ColumnHoverCard;
