import { useState, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface File {
  size: number;
  downloads: number;
  name: string;
  updatedAt: string;
}

export function useFileManagement() {
  const [files, setFiles] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/files?page=${currentPage}&search=${debouncedSearchTerm}`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setFiles(data.files);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  }, [currentPage, debouncedSearchTerm]);

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleCopy = (filename: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(
          `${window.location.origin}/api/download?filename=${filename}`,
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
    files,
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
  };
}
