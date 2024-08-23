import { useState, useCallback, useMemo, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface File {
  size: number;
  downloads: number;
  name: string;
  updatedAt: string;
}

type SortType = "name" | "date" | "size" | "downloads";
type SortOrder = "asc" | "desc";

interface SortState {
  by: SortType;
  orders: Record<SortType, SortOrder>;
}

export function useFileManagement() {
  const [files, setFiles] = useState<File[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const [sortState, setSortState] = useState<SortState>(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sortState");
      if (savedState) {
        return JSON.parse(savedState);
      }
    }
    return {
      by: "name",
      orders: {
        name: "asc",
        date: "asc",
        size: "asc",
        downloads: "asc",
      },
    };
  });

  useEffect(() => {
    localStorage.setItem("sortState", JSON.stringify(sortState));
  }, [sortState]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/files?page=${currentPage}&search=${debouncedSearchTerm}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setFiles(data.files);
      setTotalPages(data.totalPages);
      setTotalFiles(data.totalFiles);
      setTotalSize(data.totalSize);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  }, [currentPage, debouncedSearchTerm]);

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      const order = sortState.orders[sortState.by];
      if (sortState.by === "name") {
        return order === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortState.by === "date") {
        return order === "asc"
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortState.by === "size") {
        return order === "asc" ? a.size - b.size : b.size - a.size;
      } else if (sortState.by === "downloads") {
        return order === "asc"
          ? a.downloads - b.downloads
          : b.downloads - a.downloads;
      }
      return 0;
    });
  }, [files, sortState]);

  const updateSort = (type: SortType) => {
    setSortState((prev) => ({
      by: type,
      orders: {
        ...prev.orders,
        [type]: prev.orders[type] === "asc" ? "desc" : "asc",
      },
    }));
  };

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleCopy = (filename: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(
          `${window.location.origin}/api/download?filename=${filename}`
        )
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    } else {
      // Fallback for browsers that don't support the Clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = `${window.location.origin}/api/download?filename=${filename}`;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownload = (filename: string) => {
    window.location.href = `/api/download?filename=${filename}`;
  };

  return {
    files: sortedFiles,
    searchTerm,
    currentPage,
    totalPages,
    loading,
    initialLoadDone,
    fetchFiles,
    handleSearch,
    handleCopy,
    handleDownload,
    setCurrentPage,
    totalFiles,
    totalSize,
    sortState,
    updateSort,
  };
}
