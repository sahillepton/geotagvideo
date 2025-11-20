import { usePage } from "@/lib/store";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

const TablePagination = ({
  getPageNumbers,
}: {
  getPageNumbers: () => (number | string)[];
}) => {
  const { page, setPage } = usePage();

  return (
    <div className="flex items-center justify-center py-4 mt-4">
      <Pagination>
        <PaginationContent className="gap-1">
          {/* Previous */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setPage(Math.max(page - 1, 1))}
              className="cursor-pointer"
            />
          </PaginationItem>

          {/* Page Numbers */}
          {getPageNumbers().map((num, idx) => (
            <PaginationItem key={idx}>
              {num === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={() => setPage(num as number)}
                  isActive={num === page}
                  className={`px-3 py-1.5 text-sm font-medium border-none rounded-full transition-all duration-300
            ${
              num === page
                ? "bg-[#006fee] text-white shadow-md scale-105"
                : "text-gray-800 hover:bg-gray-100 hover:scale-105"
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
              onClick={() => setPage(Math.min(page + 1, 10000))}
              className="cursor-pointer"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default TablePagination;
