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
  downloads: number;
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

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString().slice(0, -3).replace(":", ".")
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card rounded-lg p-4 shadow-sm">
        <h2 className="text-2xl font-bold text-primary">Files</h2>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={onRefresh}
            variant="outline"
            className={buttonClasses}
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {currentRoute !== "/files" && (
            <Button
              onClick={() => router.push("/files")}
              variant="outline"
              className={buttonClasses}
            >
              <AllFilesIcon className="w-4 h-4 mr-2" />
              View All
            </Button>
          )}
          <Button
            onClick={() => {
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
              setSortBy("name");
            }}
            variant={sortBy === "name" ? "default" : "outline"}
            className={buttonClasses}
          >
            <SortIcon className="w-4 h-4 mr-2" type="name" order={sortOrder} />
            {sortBy === "name" ? (sortOrder === "asc" ? "A-Z" : "Z-A") : "Name"}
          </Button>
          <Button
            onClick={() => {
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
              setSortBy("date");
            }}
            variant={sortBy === "date" ? "default" : "outline"}
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
              className="bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-4 w-full">
                <FileIcon className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
                <div className="flex-grow min-w-0">
                  <Link
                    href={`/files/${encodeURIComponent(file.name)}`}
                    passHref
                  >
                    <p className="font-semibold text-primary hover:text-primary/80 cursor-pointer truncate text-lg">
                      {file.name}
                    </p>
                  </Link>
                  <div className="flex flex-col text-sm text-muted-foreground gap-1 mt-2">
                    <p className="truncate">
                      Modified: {formatDate(file.updatedAt)}
                    </p>
                    <p>Size: {formatFileSize(file.size)}</p>
                    <p>Downloads: {file.downloads}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full justify-start mt-4">
                <Button
                  variant={isCopied ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCopy(file.name)}
                  disabled={isCopied}
                  className={buttonClasses}
                >
                  <CopyIcon className="w-4 h-4 mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file.name)}
                  disabled={isDownloading}
                  className={buttonClasses}
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  {isDownloading ? "Downloading..." : "Download"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
