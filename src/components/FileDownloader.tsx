"use client";

import { useState, useEffect, useCallback } from "react";
import { FileUploader } from "./FileUploader";
import { Pagination } from "./Pagination";
import { FileList } from "./FileList";
import { SearchBar } from "./SearchBar";
import { LoadingIndicator } from "./LoadingIndicator";
import { useDebounce } from "@/hooks/useDebounce";

interface File {
  name: string;
  updatedAt: string;
}

export function FileDownloader() {
  const [files, setFiles] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

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

  useEffect(() => {
    fetchFiles();
  }, [currentPage, fetchFiles, debouncedSearchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFiles();
  };

  const handleCopy = (filename: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/api/download?filename=${filename}`,
    );
  };

  const handleDownload = (filename: string) => {
    window.location.href = `/api/download?filename=${filename}`;
  };

  return (
    <section className="mb-8">
      <FileUploader onUploadComplete={fetchFiles} />
      <h2 className="text-2xl font-bold mb-4">Download Files</h2>
      <div className="bg-muted rounded-lg p-6">
        <SearchBar
          searchTerm={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading && <LoadingIndicator loading="files" />}
        {!loading && initialLoadDone && (
          <>
            {files.length > 0 ? (
              <FileList
                files={files}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onRefresh={fetchFiles}
              />
            ) : (
              <p className="text-gray-500">No files found.</p>
            )}
          </>
        )}
        {!loading && initialLoadDone && files.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </section>
  );
}
