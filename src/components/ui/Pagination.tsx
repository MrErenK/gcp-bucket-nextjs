import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          variant="outline"
          className={cn(
            "group transition-all duration-300",
            "hover:border-foreground/40 hover:bg-accent",
            "disabled:opacity-50 disabled:hover:bg-transparent",
          )}
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          Previous
        </Button>

        <div className="hidden sm:flex items-center gap-2">
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            const isActive = page === currentPage;

            return (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                variant={isActive ? "default" : "outline-solid"}
                className={cn(
                  "min-w-[40px] transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:border-foreground/40 hover:bg-accent",
                )}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          variant="outline"
          className={cn(
            "group transition-all duration-300",
            "hover:border-foreground/40 hover:bg-accent",
            "disabled:opacity-50 disabled:hover:bg-transparent",
          )}
        >
          Next
          <ChevronRightIcon className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>
    </nav>
  );
}
