"use client";
import React, { useEffect, useCallback } from "react";
import { FileUploader } from "./FileUploader";
import { Pagination } from "./Pagination";
import { FileList } from "./FileList";
import { SearchBar } from "./SearchBar";
import { LoadingIndicator } from "./LoadingIndicator";
import { useFileManagement } from "@/hooks/useFileManagement";

export function FileManager() {
  const {
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
  } = useFileManagement();

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleRefresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  return (
    <section className="mb-8">
      <FileUploader onUploadComplete={handleRefresh} />
      <h2 className="text-2xl font-bold mb-4">Download Files</h2>
      <div className="bg-muted rounded-lg p-6">
        <SearchBar
          searchTerm={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <FileContent
          loading={loading}
          initialLoadDone={initialLoadDone}
          files={files}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onRefresh={handleRefresh}
        />
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

interface FileContentProps {
  loading: boolean;
  initialLoadDone: boolean;
  files: { name: string; updatedAt: string }[];
  onCopy: (filename: string) => void;
  onDownload: (filename: string) => void;
  onRefresh: () => Promise<void>;
}

export function FileContent({
  loading,
  initialLoadDone,
  files,
  onCopy,
  onDownload,
  onRefresh,
}: FileContentProps) {
  if (loading) return <LoadingIndicator loading="files" />;
  if (!initialLoadDone) return null;
  if (files.length === 0)
    return <p className="text-gray-500">No files found.</p>;

  return (
    <FileList
      files={files}
      onCopy={onCopy}
      onDownload={onDownload}
      onRefresh={onRefresh}
    />
  );
}
