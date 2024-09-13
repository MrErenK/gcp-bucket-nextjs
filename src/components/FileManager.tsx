"use client";
import React, { useEffect, useCallback } from "react";
import { Pagination } from "./Pagination";
import { SearchBar } from "./SearchBar";
import { useFileManagement } from "@/hooks/useFileManagement";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";

const LoadingIndicator = dynamic(
  () =>
    import("@/components/LoadingIndicator").then((mod) => mod.LoadingIndicator),
  { ssr: false },
);
const FileList = dynamic(
  () => import("@/components/FileList").then((mod) => mod.FileList),
  { ssr: false, loading: () => <LoadingIndicator loading="files" /> },
);
const FileUploader = dynamic(
  () => import("@/components/FileUploader").then((mod) => mod.FileUploader),
  { ssr: false, loading: () => <LoadingIndicator loading="uploader" /> },
);

interface FileData {
  id: string;
  name: string;
  updatedAt: string;
  downloads: number;
  size: number;
  uploadedKey: string | null;
}

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
    totalFiles,
    totalSize,
  } = useFileManagement(false);

  const handleRefresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUploadComplete = useCallback(() => {
    handleRefresh();
    toast.success("Upload completed successfully!", {
      duration: 3000,
      position: "top-right",
    });
  }, [handleRefresh]);

  return (
    <section className="mb-8">
      <FileUploader onUploadComplete={handleUploadComplete} />
      <>
        <h2 className="text-2xl font-bold mb-4">Download Files</h2>
        <div className="bg-muted rounded-lg p-6">
          <SearchBar
            searchTerm={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <FileContent
            loading={loading}
            initialLoadDone={initialLoadDone}
            files={files.map((file) => ({
              id: file.id,
              name: file.name,
              updatedAt: file.modifiedTime,
              downloads: file.downloads || 0,
              size:
                typeof file.size === "string"
                  ? parseInt(file.size, 10)
                  : file.size || 0,
              uploadedKey: (file as any).uploadedKey || null,
            }))}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onRefresh={handleRefresh}
            totalFiles={totalFiles}
            totalSize={totalSize}
          />

          {!loading && initialLoadDone && files.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </>
    </section>
  );
}

interface FileContentProps {
  loading: boolean;
  initialLoadDone: boolean;
  files: FileData[];
  onCopy: (fileId: string) => void;
  onDownload: (fileId: string) => void;
  onRefresh: () => Promise<void>;
  totalFiles: number;
  totalSize: number;
}

export function FileContent({
  loading,
  initialLoadDone,
  files,
  onCopy,
  onDownload,
  onRefresh,
  totalFiles,
  totalSize,
}: FileContentProps) {
  if (!initialLoadDone) return null;
  if (files.length === 0)
    return <p className="text-gray-500">No files found.</p>;

  return (
    <FileList
      files={files}
      onCopy={onCopy}
      onDownload={onDownload}
      onRefresh={onRefresh}
      totalFiles={totalFiles}
      totalSize={totalSize}
    />
  );
}
