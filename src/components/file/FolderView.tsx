import React, { useState, useEffect } from "react";
import { FileList } from "@/components/file/FileList";

interface FolderViewProps {
  files: Array<{
    name: string;
    size: number;
    updatedAt: string;
  }>;
  onCopyAction: (filename: string) => void;
  onDownloadAction: (filename: string) => void;
  onRefreshAction: () => Promise<void>;
  loading?: boolean;
}

const PAGE_SIZE = 9;

export function FolderView({
  files,
  onCopyAction,
  onDownloadAction,
  onRefreshAction,
  loading = false,
}: FolderViewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the file list changes (e.g. after search)
  useEffect(() => {
    setCurrentPage(1);
  }, [files.length]);

  const indexOfFirst = (currentPage - 1) * PAGE_SIZE;
  const currentFiles = files.slice(indexOfFirst, indexOfFirst + PAGE_SIZE);
  const totalPages = Math.ceil(files.length / PAGE_SIZE);
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <FileList
      files={currentFiles}
      onCopyAction={onCopyAction}
      onDownloadAction={onDownloadAction}
      onRefreshAction={onRefreshAction}
      loading={loading}
      totalFiles={files.length}
      totalSize={totalSize}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      showPagination={true}
    />
  );
}
