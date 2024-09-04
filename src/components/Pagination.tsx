import React from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const ChevronLeftIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.ChevronLeftIcon),
  { ssr: false },
);
const ChevronRightIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.ChevronRightIcon),
  { ssr: false },
);

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
  const buttonClasses = `
    transition duration-300 ease-in-out
    hover:bg-primary hover:text-primary-foreground
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50
    flex items-center justify-center px-4 py-2
    text-sm font-medium rounded-full
  `;

  return (
    <nav
      className="mt-8 flex flex-wrap justify-center items-center gap-4"
      aria-label="Pagination"
    >
      <Button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`${buttonClasses} ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
        variant="outline"
      >
        <ChevronLeftIcon />
        <span className="ml-2">Previous</span>
      </Button>

      <div className="flex items-center bg-secondary text-secondary-foreground rounded-full overflow-hidden">
        <span className="px-4 py-2 text-sm font-medium border-r border-secondary-foreground/20">
          Page {currentPage}
        </span>
        <span className="px-4 py-2 text-sm font-medium">of {totalPages}</span>
      </div>

      <Button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`${buttonClasses} ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
        variant="outline"
      >
        <span className="mr-2">Next</span>
        <ChevronRightIcon />
      </Button>
    </nav>
  );
}
