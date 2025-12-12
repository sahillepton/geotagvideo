"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  maxPagesToShow = 5,
}: TablePaginationProps) {
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === "number") {
      onPageChange(page);
    }
  };

  if (totalPages <= 0) return null;

  return (
    <div className="flex items-center justify-center mt-4">
      <Pagination className="bg-[#f0f0f0] w-full max-w-[450px] rounded-full ">
        <PaginationContent className="gap-1">
          {/* Previous */}
          <PaginationItem className="">
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePrevious();
              }}
              className={`cursor-pointer hover:bg-transparent ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
          </PaginationItem>

          {/* Page Numbers */}
          {getPageNumbers().map((num, idx) => (
            <PaginationItem key={idx} className="py-1">
              {num === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageClick(num);
                  }}
                  isActive={num === currentPage}
                  className={`px-3 py-1.5 text-sm font-medium border-none rounded-full transition-all duration-300
                    ${
                      num === currentPage
                        ? "bg-[#1e1e1e] text-white shadow-md scale-105 hover:bg-[#1e1e1e] hover:text-white"
                        : "text-gray-800 hover:bg-gray-100"
                    }`}
                >
                  {num}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className={`cursor-pointer hover:bg-transparent ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
