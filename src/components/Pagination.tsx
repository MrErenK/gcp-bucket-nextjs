import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

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
  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground flex items-center justify-center";

  return (
    <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
      <Button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`w-28 sm:w-36 ${buttonClasses}`}
        variant="outline"
      >
        <ChevronLeftIcon className="w-4 h-4 mr-2" />
        Previous
      </Button>
      <span className="text-sm bg-secondary text-secondary-foreground py-2 px-4 rounded-full">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`w-28 sm:w-36 ${buttonClasses}`}
        variant="outline"
      >
        Next
        <ChevronRightIcon className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
