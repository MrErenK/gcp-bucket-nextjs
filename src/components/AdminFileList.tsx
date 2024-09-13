"use client";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
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
import { getFileIcon } from "@/components/Icons";

const FileIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.FileIcon),
  { ssr: false },
);
const TrashIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.TrashIcon),
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
const LoadingIndicator = dynamic(
  () =>
    import("@/components/LoadingIndicator").then((mod) => mod.LoadingIndicator),
  { ssr: false },
);
const RenameIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.RenameIcon),
  { ssr: false },
);

interface File {
  id: string;
  name: string;
  updatedAt: string;
  size: number;
  downloads: number;
  uploadedKey: string | null;
}

interface AdminFileListProps {
  files: File[];
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

export function AdminFileList({
  files,
  onRefresh,
  totalFiles,
  totalSize,
}: AdminFileListProps) {
  const { sortState, updateSort } = useFileManagement();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState("");
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [fileToRename, setFileToRename] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [adminApiKey, setAdminApiKey] = useState("");

  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground";

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

  const handleDelete = async (fileId: string) => {
    setFileToDelete(fileId);
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
        `/api/delete?fileId=${encodeURIComponent(fileToDelete)}`,
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
      onRefresh();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file. Please try again.");
    }
    setFileToDelete("");
  };

  const handleRename = async (fileId: string, fileName: string) => {
    setFileToRename(fileId);
    setNewFileName(fileName);
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
      const response = await fetch(`/api/rename`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminApiKey}`,
        },
        body: JSON.stringify({
          fileId: fileToRename,
          newFileName: newFileName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename file");
      }

      toast.success("File renamed successfully");
      onRefresh();
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
      await onRefresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg p-6 shadow-md">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Files</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className={buttonClasses}
              disabled={isLoading}
            >
              {isLoading ? (
                <p className="animate-pulse">Refreshing...</p>
              ) : (
                <>
                  <RefreshIcon className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
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
                        ? "Old"
                        : type === "size"
                          ? "Small"
                          : "Fewest Downloads"
                    : type === "name"
                      ? "Z-A"
                      : type === "date"
                        ? "New"
                        : type === "size"
                          ? "Large"
                          : "Most Downloads"
                  : type === "name"
                    ? "Sort by Name"
                    : type === "date"
                      ? "Sort by Date"
                      : type === "size"
                        ? "Sort by Size"
                        : "Sort by Downloads"
              }
            />
          ))}
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingIndicator loading="files" />
        </div>
      ) : (
        <AnimatePresence>
          {sortedFiles.map((file) => {
            const FileTypeIcon = getFileIcon(file.name);

            return (
              <motion.div
                key={file.id}
                className="bg-card rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex items-start gap-4">
                    <FileTypeIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <Link
                        href={`/admin/files/${encodeURIComponent(file.id)}`}
                        passHref
                      >
                        <h3 className="font-semibold text-primary hover:text-primary/80 cursor-pointer text-lg sm:text-xl break-words">
                          {file.name}
                        </h3>
                      </Link>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <DownloadCountIcon className="w-4 h-4 mr-1" />
                        <strong>{file.downloads}</strong>
                        <span className="mx-2">•</span>
                        <FileStatsIcon className="w-4 h-4 mr-1" />
                        <span>{formatFileSize(file.size)}</span>
                        <span className="mx-2">•</span>
                        <ApiKeyIcon className="w-4 h-4 mr-1" />
                        <span>{file.uploadedKey || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Modified:</span>{" "}
                      {formatDate(file.updatedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full justify-start mt-2">
                    <FileActionButton
                      variant="secondary"
                      onClick={() => handleRename(file.id, file.name)}
                      disabled={false}
                      icon={<RenameIcon className="w-4 h-4" />}
                      label="Rename"
                    />
                    <FileActionButton
                      variant="destructive"
                      onClick={() => handleDelete(file.id)}
                      disabled={false}
                      icon={<TrashIcon className="w-4 h-4" />}
                      label="Delete"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-primary">{fileToDelete}</span>?
          </p>
          <Input
            type="password"
            value={adminApiKey}
            onChange={(e) => setAdminApiKey(e.target.value)}
            placeholder="Enter Admin API Key"
            className="mb-4"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit}>
            <Input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter new file name"
              className="mb-4"
            />
            <Input
              type="password"
              value={adminApiKey}
              onChange={(e) => setAdminApiKey(e.target.value)}
              placeholder="Enter Admin API Key"
              className="mb-4"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRenameDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Rename</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
