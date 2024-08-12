"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  FileIcon,
  CopyIcon,
  DownloadIcon,
  SortIcon,
  RefreshIcon,
  AllFilesIcon,
} from "./Icons";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface File {
  name: string;
  updatedAt: string;
  size?: number;
}

interface FileListProps {
  files: File[];
  onCopy: (filename: string) => void;
  onDownload: (filename: string) => void;
  onRefresh: () => Promise<void>;
}

export function FileList({
  files,
  onCopy,
  onDownload,
  onRefresh,
}: FileListProps) {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [downloadingStates, setDownloadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<"name" | "date">("name");
  const router = useRouter();
  const pathname = usePathname();
  const currentRoute = pathname.split("?")[0];

  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground";

  const handleCopy = useCallback(
    (filename: string) => {
      onCopy(filename);
      setCopiedStates((prev) => ({ ...prev, [filename]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [filename]: false }));
      }, 2000);
    },
    [onCopy],
  );

  const handleDownload = useCallback(
    (filename: string) => {
      onDownload(filename);
      setDownloadingStates((prev) => ({ ...prev, [filename]: true }));
      setTimeout(() => {
        setDownloadingStates((prev) => ({ ...prev, [filename]: false }));
      }, 2000);
    },
    [onDownload],
  );

  const filteredAndSortedFiles = useMemo(() => {
    return files.sort((a, b) => {
      if (sortBy === "name") {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === "asc" ? comparison : -comparison;
      } else {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        const comparison = dateA.getTime() - dateB.getTime();
        return sortOrder === "asc" ? comparison : -comparison;
      }
    });
  }, [files, sortOrder, sortBy]);

  function formatFileSize(bytes: number | undefined) {
    if (bytes === undefined || isNaN(bytes)) return "Unknown size";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold">Files</h2>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {currentRoute !== "/files" && (
            <Button
              onClick={() => router.push("/files")}
              className={buttonClasses}
            >
              <AllFilesIcon className="w-4 h-4 mr-2" />
              View All
            </Button>
          )}
          <Button onClick={onRefresh} className={buttonClasses}>
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
              setSortBy("name");
            }}
            className={buttonClasses}
          >
            <SortIcon className="w-4 h-4 mr-2" order={sortOrder} type="name" />
            {sortBy === "name" ? (sortOrder === "asc" ? "A-Z" : "Z-A") : "Name"}
          </Button>
          <Button
            onClick={() => {
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
              setSortBy("date");
            }}
            className={buttonClasses}
          >
            <SortIcon className="w-4 h-4 mr-2" type="date" order={sortOrder} />
            {sortBy === "date" ? (sortOrder === "asc" ? "Old" : "New") : "Date"}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {filteredAndSortedFiles.map((file) => {
          const isCopied = copiedStates[file.name];
          const isDownloading = downloadingStates[file.name];

          return (
            <motion.div
              key={file.name}
              className="bg-background rounded-lg p-4 flex flex-col gap-4 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-4 w-full">
                <FileIcon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div className="flex-grow min-w-0">
                  <Link
                    href={`/files/${encodeURIComponent(file.name)}`}
                    passHref
                  >
                    <p className="font-medium text-blue-600 hover:underline cursor-pointer truncate">
                      {file.name}
                    </p>
                  </Link>
                  <div className="flex flex-col text-sm text-muted-foreground gap-1 mt-1">
                    <p className="truncate">
                      Modified: {new Date(file.updatedAt).toLocaleDateString()}
                    </p>
                    <p>Size: {formatFileSize(file.size)}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full justify-start mt-2">
                <Button
                  className={buttonClasses}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(file.name)}
                  disabled={isCopied}
                >
                  <CopyIcon className="w-4 h-4 mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  className={buttonClasses}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file.name)}
                  disabled={isDownloading}
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  {isDownloading ? "..." : "Download"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
