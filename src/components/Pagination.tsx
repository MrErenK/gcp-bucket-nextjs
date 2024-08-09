import { useState, useEffect } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const [showPagination, setShowPagination] = useState<boolean | null>(null);

  useEffect(() => {
    setShowPagination(totalPages > 1);
  }, [totalPages]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  if (showPagination === null) {
    return null; // Prevents flashing by not rendering until `showPagination` is determined.
  }

  return showPagination ? (
    <div className="flex justify-center space-x-2 mt-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-colors duration-200"
      >
        Previous
      </button>
      <span className="px-4 py-2 bg-surface-light dark:bg-surface-dark rounded-md transition-colors duration-200">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-colors duration-200"
      >
        Next
      </button>
    </div>
  ) : null;
}
