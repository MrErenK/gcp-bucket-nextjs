"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { formatFileSize } from "@/lib/utils";
import { useFileManagement } from "@/hooks/useFileManagement";

const FileIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.FileIcon),
  { ssr: false },
);
const CopyIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.CopyIcon),
  { ssr: false },
);
const DownloadIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.DownloadIcon),
  { ssr: false },
);
const SortIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.SortIcon),
  { ssr: false },
);
const RefreshIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.RefreshIcon),
  { ssr: false },
);
const AllFilesIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.AllFilesIcon),
  { ssr: false },
);
const DownloadCountIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.DownloadCountIcon),
  { ssr: false },
);
const FileStatsIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.FileStatsIcon),
  { ssr: false },
);
const ApiKeyIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.ApiKeyIcon),
  { ssr: false },
);

interface File {
  name: string;
  updatedAt: string;
  size: number;
  downloads: number;
  uploadedKey: string | null;
}

interface FileListProps {
  files: File[];
  onCopy: (filename: string) => void;
  onDownload: (filename: string) => void;
  onRefresh: () => Promise<void>;
  totalFiles: number;
  totalSize: number;
}

type SortType = "name" | "date" | "size" | "downloads";
type SortOrder = "asc" | "desc";

interface SortState {
  by: SortType;
  orders: Record<SortType, SortOrder>;
}

export function FileList({
  files,
  onCopy,
  onDownload,
  onRefresh,
  totalFiles,
  totalSize,
}: FileListProps) {
  const { sortState, updateSort } = useFileManagement();
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [downloadingStates, setDownloadingStates] = useState<{
    [key: string]: boolean;
  }>({});
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

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString().slice(0, -3).replace(":", ".")
    );
  }

  const SortButton = ({
    onClick,
    active,
    icon,
    label,
  }: {
    onClick: () => void;
    active: boolean;
    icon: JSX.Element;
    label: string;
  }) => (
    <Button
      onClick={onClick}
      variant={active ? "default" : "outline"}
      size="sm"
      className={buttonClasses}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Button>
  );

  const FileActionButton = ({
    variant,
    onClick,
    disabled,
    icon,
    label,
  }: {
    variant:
      | "active"
      | "link"
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | null
      | undefined;
    onClick: () => void;
    disabled: boolean;
    icon: JSX.Element;
    label: string;
  }) => (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg p-4 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Files</h2>
            <h3 className="text-sm text-muted-foreground">
              Total: {totalFiles} files, {formatFileSize(totalSize)}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className={`${buttonClasses} whitespace-nowrap`}
            >
              <RefreshIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {currentRoute !== "/files" && (
              <Button
                onClick={() => router.push("/files")}
                variant="outline"
                size="sm"
                className={`${buttonClasses} whitespace-nowrap`}
              >
                <AllFilesIcon className="w-4 h-4 mr-2" />
                View All
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["name", "date", "size", "downloads"] as const).map((type) => (
            <SortButton
              key={type}
              onClick={() => updateSort(type)}
              active={sortState.by === type}
              icon={
                <SortIcon
                  className="w-4 h-4"
                  type={type}
                  order={sortState.orders[type]}
                />
              }
              label={
                sortState.by === type
                  ? sortState.orders[type] === "asc"
                    ? type === "name"
                      ? "A-Z"
                      : type === "date"
                        ? "Older"
                        : type === "size"
                          ? "Smaller"
                          : "Fewer"
                    : type === "name"
                      ? "Z-A"
                      : type === "date"
                        ? "Newer"
                        : type === "size"
                          ? "Larger"
                          : "More"
                  : type.charAt(0).toUpperCase() + type.slice(1)
              }
            />
          ))}
        </div>
      </div>
      <AnimatePresence>
        {sortedFiles.map((file) => {
          const isCopied = copiedStates[file.name];
          const isDownloading = downloadingStates[file.name];

          return (
            <motion.div
              key={file.name}
              className="bg-card rounded-lg p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 w-full">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                  <FileIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary flex-shrink-0" />
                  <div className="flex-grow min-w-0">
                    <Link
                      href={`/files/${encodeURIComponent(file.name)}`}
                      passHref
                    >
                      <h3 className="font-semibold text-primary hover:text-primary/80 cursor-pointer text-base sm:text-lg md:text-xl break-words">
                        {file.name}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center mt-1 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center mr-2">
                        <DownloadCountIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <strong>{file.downloads}</strong>
                      </div>
                      <span className="mx-1 sm:mx-2 hidden xs:inline">•</span>
                      <div className="flex items-center mr-2">
                        <FileStatsIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                      <span className="mx-1 sm:mx-2 hidden xs:inline">•</span>
                      <div className="flex items-center">
                        <ApiKeyIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="truncate max-w-[100px] sm:max-w-[150px] text-xs sm:text-sm font-mono">
                          {file.uploadedKey || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <p>
                    <span className="font-bold">Modified:</span>{" "}
                    {formatDate(file.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full justify-start mt-1 sm:mt-2">
                  <FileActionButton
                    variant={isCopied ? "default" : "outline"}
                    onClick={() => handleCopy(file.name)}
                    disabled={isCopied}
                    icon={<CopyIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
                    label={isCopied ? "Copied!" : "Copy"}
                  />
                  <FileActionButton
                    variant="outline"
                    onClick={() => handleDownload(file.name)}
                    disabled={isDownloading}
                    icon={<DownloadIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
                    label={isDownloading ? "Downloading..." : "Download"}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
