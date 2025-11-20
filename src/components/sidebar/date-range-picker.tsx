"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDateFrom, useDateTo } from "@/lib/store";
export function DateRangePicker() {
  const { dateFrom, setDateFrom } = useDateFrom();
  const { dateTo, setDateTo } = useDateTo();
  const [fromOpen, setFromOpen] = React.useState(false);
  const [toOpen, setToOpen] = React.useState(false);

  const handleFromDateSelect = (date: Date | undefined) => {
    setDateFrom(date);
    setFromOpen(false);
  };

  const handleToDateSelect = (date: Date | undefined) => {
    setDateTo(date);
    setToOpen(false);
  };

  return (
    <div className="flex gap-2">
      <Popover open={fromOpen} onOpenChange={setFromOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-24 justify-between font-normal text-xs h-8 bg-[#006fee] text-white rounded-lg border-none hover:bg-[#006fee]/80 hover:text-white "
            title={dateFrom ? dateFrom.toLocaleDateString() : "From Date"}
          >
            {dateFrom ? dateFrom.toLocaleDateString() : "From Date"}
            <ChevronDownIcon className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={dateFrom}
            captionLayout="dropdown"
            onSelect={handleFromDateSelect}
            disabled={(date) => (dateTo ? date > dateTo : false)}
          />
        </PopoverContent>
      </Popover>

      <Popover open={toOpen} onOpenChange={setToOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-24 justify-between font-normal text-xs h-8 bg-[#006fee] text-white rounded-lg border-none hover:bg-[#006fee]/80 hover:text-white"
            title={dateTo ? dateTo.toLocaleDateString() : "To Date"}
          >
            {dateTo ? dateTo.toLocaleDateString() : "To Date"}
            <ChevronDownIcon className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={dateTo}
            captionLayout="dropdown"
            onSelect={handleToDateSelect}
            disabled={(date) => (dateFrom ? date < dateFrom : false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
