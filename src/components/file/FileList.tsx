"use client";
import React, { useState, useCallback, useMemo, JSX } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { formatFileSize } from "@/lib/utils";
import { useFileManagement } from "@/hooks/useFileManagement";
import {
  getFileIcon,
  RefreshIcon,
  CopyIcon,
  DownloadIcon,
  FileStatsIcon,
  SortIcon,
  AllFilesIcon,
  CheckIcon,
  ClockIcon,
  LoadingIcon,
} from "@/components/ui/Icons";
import { FilesSkeleton } from "../ui/FilesSkeleton";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";

interface File {
  name: string;
  updatedAt: string;
  size: number;
}

interface FileListProps {
  files: File[];
  onCopyAction: (filename: string) => void;
  onDownloadAction: (filename: string) => void;
  onRefreshAction: () => Promise<void>;
  totalFiles: number;
  totalSize: number;
  loading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
}

export function FileList({
  files,
  onCopyAction,
  onDownloadAction,
  onRefreshAction,
  totalFiles,
  totalSize,
  loading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPagination = false,
}: FileListProps) {
  const { sortState, updateSort } = useFileManagement();
  const [copiedStates, setCopiedStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [downloadingStates, setDownloadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentRoute = pathname.split("?")[0];

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
      }
      return 0;
    });
  }, [files, sortState]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshAction();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleCopy = useCallback(
    (filename: string) => {
      onCopyAction(filename);
      setCopiedStates((prev) => ({ ...prev, [filename]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [filename]: false }));
      }, 2000);
    },
    [onCopyAction],
  );

  const handleDownload = useCallback(
    (filename: string) => {
      onDownloadAction(filename);
      setDownloadingStates((prev) => ({ ...prev, [filename]: true }));
      setTimeout(() => {
        setDownloadingStates((prev) => ({
          ...prev,
          [filename]: false,
        }));
      }, 2000);
    },
    [onDownloadAction],
  );

  if (loading) return <FilesSkeleton />;

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="relative bg-card rounded-2xl p-3 md:p-6 shadow-sm border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
            <div className="space-y-1 w-full sm:w-auto">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg md:text-2xl font-bold"
              >
                Files
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs md:text-sm text-muted-foreground"
              >
                Total: {totalFiles} files ({formatFileSize(totalSize)})
              </motion.p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className={cn(
                  "group transition-all duration-300 hover:border-foreground/40 w-full sm:w-auto text-xs md:text-sm",
                  isRefreshing && "opacity-50 cursor-not-allowed",
                )}
              >
                <RefreshIcon
                  className={cn(
                    "w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 transition-transform duration-500",
                    isRefreshing ? "animate-spin" : "group-hover:rotate-180",
                  )}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>

              {currentRoute !== "/files" && (
                <Button
                  onClick={() => router.push("/files")}
                  variant="outline"
                  size="sm"
                  className="group transition-all duration-300 hover:border-foreground/40 w-full sm:w-auto text-xs md:text-sm"
                >
                  <AllFilesIcon className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 transition-transform duration-300 group-hover:scale-110" />
                  View All
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
            {(["name", "date", "size"] as const).map((type) => (
              <Button
                key={type}
                onClick={() => updateSort(type)}
                variant={sortState.by === type ? "default" : "outline-solid"}
                size="sm"
                className={cn(
                  "transition-all duration-300 min-w-[80px] flex-1 sm:flex-none",
                  "text-xs md:text-sm px-2 md:px-4",
                  sortState.by === type
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:border-foreground/40",
                )}
              >
                <SortIcon
                  className={cn(
                    "w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 transition-transform duration-300",
                    sortState.by === type &&
                      sortState.orders[type] === "desc" &&
                      "rotate-180",
                  )}
                  type={type}
                  order={sortState.orders[type]}
                />
                <span className="whitespace-nowrap">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </Button>
            ))}
          </div>

          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedFiles.map((file, index) => {
                const isCopied = copiedStates[file.name];
                const isDownloading = downloadingStates[file.name];
                const FileTypeIcon = getFileIcon(file.name);

                return (
                  <motion.div
                    key={file.name}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                    className={cn(
                      "group relative bg-card rounded-lg p-2 md:p-4 lg:p-5",
                      "border hover:border-foreground/25",
                      "shadow-md hover:shadow-lg",
                      "transition-all duration-300",
                    )}
                  >
                    <div className="flex flex-col justify-between h-full gap-2 md:gap-3 lg:gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="p-1.5 sm:p-2 bg-accent rounded-lg shrink-0"
                          >
                            <FileTypeIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-primary" />
                          </motion.div>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/files/${encodeURIComponent(file.name)}`}
                              className="block"
                            >
                              <h3 className="font-medium text-xs sm:text-sm md:text-base hover:text-primary transition-colors duration-300 break-all">
                                {file.name}
                              </h3>
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col w-full gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="inline-flex items-center text-xs sm:text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                            <FileStatsIcon className="w-3 h-3 xs:w-3 xs:h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-1 xs:mr-1 sm:mr-1.5 shrink-0" />
                            {formatFileSize(file.size)}
                          </span>
                          <span className="inline-flex items-center text-xs sm:text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                            <ClockIcon className="w-3 h-3 xs:w-3 xs:h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-1 xs:mr-1 sm:mr-1.5 shrink-0" />
                            {formatDate(file.updatedAt)}
                          </span>
                        </div>

                        <div className="flex flex-col xs:flex-row gap-1.5 sm:gap-2">
                          <Button
                            onClick={() => handleCopy(file.name)}
                            variant={isCopied ? "default" : "outline-solid"}
                            size="default"
                            className={cn(
                              "transition-all duration-300 flex-1 text-[8px] xs:text-[10px] sm:text-sm md:text-base h-6 xs:h-7 sm:h-8 md:h-9 lg:h-10 px-1.5 xs:px-2 sm:px-4 md:px-6",
                              isCopied
                                ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                : "hover:border-foreground/40",
                            )}
                            disabled={isCopied}
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={isCopied ? "check" : "copy"}
                                initial={{
                                  scale: 0.5,
                                  opacity: 0,
                                }}
                                animate={{
                                  scale: 1,
                                  opacity: 1,
                                }}
                                exit={{
                                  scale: 0.5,
                                  opacity: 0,
                                }}
                                className="flex items-center justify-center w-full"
                              >
                                {isCopied ? (
                                  <>
                                    <CheckIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3 md:w-4 md:h-4 mr-1 md:mr-2 shrink-0" />
                                    <span className="whitespace-nowrap">
                                      Copied!
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <CopyIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3 md:w-4 md:h-4 mr-1 md:mr-2 shrink-0" />
                                    <span className="whitespace-nowrap">
                                      Copy Link
                                    </span>
                                  </>
                                )}
                              </motion.div>
                            </AnimatePresence>
                          </Button>

                          <Button
                            onClick={() => handleDownload(file.name)}
                            variant="outline"
                            size="default"
                            className={cn(
                              "transition-all duration-300 hover:border-foreground/40 flex-1 text-[8px] xs:text-[10px] sm:text-sm md:text-base h-6 xs:h-7 sm:h-8 md:h-9 lg:h-10 px-1.5 xs:px-2 sm:px-4 md:px-6",
                              isDownloading && "opacity-50",
                            )}
                            disabled={isDownloading}
                          >
                            <motion.div
                              key={isDownloading ? "downloading" : "download"}
                              initial={{
                                scale: 0.5,
                                opacity: 0,
                              }}
                              animate={{
                                scale: 1,
                                opacity: 1,
                              }}
                              exit={{
                                scale: 0.5,
                                opacity: 0,
                              }}
                              className="flex items-center justify-center w-full"
                            >
                              {isDownloading ? (
                                <>
                                  <LoadingIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3 md:w-4 md:h-4 mr-1 md:mr-2 shrink-0" />
                                  <span className="whitespace-nowrap">
                                    Downloading...
                                  </span>
                                </>
                              ) : (
                                <>
                                  <DownloadIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3 md:w-4 md:h-4 mr-1 md:mr-2 shrink-0" />
                                  <span className="whitespace-nowrap">
                                    Download
                                  </span>
                                </>
                              )}
                            </motion.div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>
      </motion.div>

      {showPagination && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
