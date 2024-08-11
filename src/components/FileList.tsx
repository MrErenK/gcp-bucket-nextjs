import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, CopyIcon, DownloadIcon, SortIcon, RefreshIcon } from "./Icons";
import { motion, AnimatePresence } from "framer-motion";

interface File {
  name: string;
  updatedAt: string;
}

interface FileListProps {
  files: File[];
  onCopy: (filename: string) => void;
  onDownload: (filename: string) => void;
  onRefresh: () => Promise<void>;
}

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || "http://localhost:3000";

export function FileList({
  files,
  onCopy,
  onDownload,
  onRefresh,
}: FileListProps) {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [downloadingStates, setDownloadingStates] = useState<{ [key: string]: boolean }>({});
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground";

  const handleClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

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
    return files
      .sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [files, sortOrder]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold">Files</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Button onClick={onRefresh} className={buttonClasses}>
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            className={buttonClasses}
          >
            <SortIcon className="w-4 h-4 mr-2" />
            {sortOrder === "asc" ? "A-Z" : "Z-A"}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {filteredAndSortedFiles.map((file) => {
          const fileUrl = `${CDN_URL}/${file.name}`;
          const isCopied = copiedStates[file.name];
          const isDownloading = downloadingStates[file.name];

          return (
            <motion.div
              key={file.name}
              className="bg-background rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 flex-1">
                <FileIcon className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <p
                    className="font-medium text-blue-600 hover:underline cursor-pointer"
                    onClick={() => handleClick(fileUrl)}
                    role="link"
                    aria-label={`View ${file.name}`}
                  >
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last modified:{" "}
                    {new Date(file.updatedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
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
