"use client";
import React, { JSX, useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatFileSize } from "@/lib/utils";
import { useFileManagement } from "@/hooks/useFileManagement";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import {
  FileIcon,
  FileStatsIcon,
  TrashIcon,
  RenameIcon,
  RefreshIcon,
  SortIcon,
  ClockIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Pagination } from "../ui/Pagination";

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
}

export function AdminFileList({
  files,
  onRefreshAction,
  totalFiles,
  totalSize,
}: FileListProps) {
  const { sortState, updateSort } = useFileManagement();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState("");
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [fileToRename, setFileToRename] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [adminApiKey, setAdminApiKey] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

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

  const indexOfLastFile = currentPage * PAGE_SIZE;
  const indexOfFirstFile = indexOfLastFile - PAGE_SIZE;
  const currentFiles = sortedFiles.slice(indexOfFirstFile, indexOfLastFile);
  const totalPages = Math.ceil(sortedFiles.length / PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortState]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString().slice(0, -3).replace(":", ".")
    );
  }

  const handleDelete = async (filename: string) => {
    setFileToDelete(filename);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
    if (!adminApiKey) {
      toast.error("Admin API key is required");
      return;
    }
    try {
      const response = await fetch(
        `/api/delete?filename=${encodeURIComponent(fileToDelete)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminApiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      toast.success("File deleted successfully");
      onRefreshAction();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file. Please try again.");
    }
    setFileToDelete("");
  };

  const handleRename = (filename: string) => {
    setFileToRename(filename);
    setNewFileName(filename);
    setShowRenameDialog(true);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newFileName) {
      toast.error("New file name is required");
      return;
    }

    if (!adminApiKey) {
      toast.error("Admin API key is required");
      return;
    }

    try {
      const response = await fetch("/api/rename", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminApiKey}`,
        },
        body: JSON.stringify({
          oldFilename: fileToRename,
          newFilename: newFileName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename file");
      }

      toast.success("File renamed successfully");
      onRefreshAction();
      setShowRenameDialog(false);
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("Failed to rename file. Please try again.");
    }

    setShowRenameDialog(false);
    setFileToRename("");
    setNewFileName("");
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefreshAction();
    } finally {
      setIsLoading(false);
    }
  };

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
                Files Management
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs md:text-sm text-muted-foreground"
              >
                Manage your uploaded files
              </motion.p>
            </div>

            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className={cn(
                "group transition-all duration-300 hover:border-foreground/40 w-full sm:w-auto text-xs md:text-sm",
                isLoading && "opacity-50 cursor-not-allowed",
              )}
            >
              <RefreshIcon
                className={cn(
                  "w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 transition-transform duration-500",
                  isLoading ? "animate-spin" : "group-hover:rotate-180",
                )}
              />
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
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
              {currentFiles.map((file, index) => (
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
                          <FileIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-primary" />
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
                          onClick={() => handleRename(file.name)}
                          variant="outline"
                          size="default"
                          className="transition-all duration-300 flex-1 text-[10px] xs:text-[11px] sm:text-sm md:text-base h-6 xs:h-7 sm:h-8 md:h-9 lg:h-10 px-1.5 xs:px-2 sm:px-4 md:px-6 hover:border-foreground/40"
                        >
                          <RenameIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3 md:w-4 md:h-4 mr-1 md:mr-2 shrink-0" />
                          Rename
                        </Button>
                        <Button
                          onClick={() => handleDelete(file.name)}
                          variant="destructive"
                          size="default"
                          className="transition-all duration-300 flex-1 text-[10px] xs:text-[11px] sm:text-sm md:text-base h-6 xs:h-7 sm:h-8 md:h-9 lg:h-10 px-1.5 xs:px-2 sm:px-4 md:px-6"
                        >
                          <TrashIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3 md:w-4 md:h-4 mr-1 md:mr-2 shrink-0" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {sortedFiles.length > PAGE_SIZE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </motion.div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-destructive">
              Confirm Delete
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {fileToDelete}
              </span>
              ? This action cannot be undone.
            </p>
            <Input
              type="password"
              value={adminApiKey}
              onChange={(e) => setAdminApiKey(e.target.value)}
              placeholder="Enter Admin API Key"
              className="h-11"
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="w-full sm:w-auto transition-all duration-300 hover:border-foreground/40"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="w-full sm:w-auto transition-all duration-300"
            >
              Delete File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Rename File
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRenameSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newFileName">New Filename</Label>
              <Input
                id="newFileName"
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new file name"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminApiKey">Admin API Key</Label>
              <Input
                id="adminApiKey"
                type="password"
                value={adminApiKey}
                onChange={(e) => setAdminApiKey(e.target.value)}
                placeholder="Enter Admin API Key"
                className="h-11"
              />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRenameDialog(false);
                  setNewFileName("");
                }}
                className="w-full sm:w-auto transition-all duration-300 hover:border-foreground/40"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto transition-all duration-300 hover:bg-primary/90"
              >
                Rename File
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
