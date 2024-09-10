"use client";
import React, { useEffect, useCallback } from "react";
import { Pagination } from "./Pagination";
import { SearchBar } from "./SearchBar";
import { useFileManagement } from "@/hooks/useFileManagement";
import dynamic from "next/dynamic";
import { UserFileManager } from "@/components/UserFileManager";

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
  name: string;
  updatedAt: string;
  downloads?: number;
  size?: number;
  uploadedKey?: string;
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

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleRefresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  return (
    <section className="mb-8">
      <FileUploader onUploadComplete={handleRefresh} />
      <>
        <div className="flex flex-col gap-4 justify-center items-center">
          <h2 className="text-2xl font-bold mb-4">Uploaded Files</h2>
          <UserFileManager />
        </div>
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
              ...file,
              name: file.name,
              updatedAt: file.updatedAt,
              downloads: file.downloads || 0,
              size: file.size || 0,
              uploadedKey: file.uploadedKey || undefined,
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
  onCopy: (filename: string) => void;
  onDownload: (filename: string) => void;
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
      files={files.map((file) => ({
        name: file.name,
        updatedAt: file.updatedAt,
        downloads: file.downloads || 0,
        size: file.size || 0,
        uploadedKey: file.uploadedKey || null,
      }))}
      onCopy={onCopy}
      onDownload={onDownload}
      onRefresh={onRefresh}
      totalFiles={totalFiles}
      totalSize={totalSize}
    />
  );
}
