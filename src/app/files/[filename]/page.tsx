"use client";
import React, { useState, useEffect } from "react";
import { useFileManagement } from "@/hooks/useFileManagement";
import { formatFileSize } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { motion } from "framer-motion";
import { getFileType } from "@/types/filetypes";
import {
  getFileIcon,
  FileStatsIcon,
  ClockIcon,
  DatabaseIcon,
  FileIcon,
  LinkIcon,
  AlertCircleIcon,
  CopyIcon,
  DownloadIcon,
} from "@/components/ui/Icons";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileDetails {
  name: string;
  size: number;
  updatedAt: string;
  contentType?: string;
  etag?: string;
  generation?: string;
  id?: string;
  timeCreated?: string;
}

export default function FilePage({
  params,
}: {
  params: Promise<{ filename: string }>;
}) {
  const resolvedParams = React.use(params);
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { handleDownload, handleCopy } = useFileManagement();

  const fileName = decodeURIComponent(resolvedParams.filename);
  const fileExtension = fileName
    .substring(fileName.lastIndexOf("."))
    .toLowerCase();
  const fileType = getFileType(fileExtension);
  const FileTypeIcon = getFileIcon(fileName);

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        const response = await fetch(
          `/api/files?filename=${encodeURIComponent(fileName)}`,
        );
        if (!response.ok) throw new Error("Failed to fetch file details");
        const data = await response.json();
        setFileDetails(data);
      } catch (err) {
        setError("Failed to load file details");
      } finally {
        setLoading(false);
      }
    };

    fetchFileDetails();
  }, [fileName]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header backHref="/files" />
        <main className="grow container mx-auto px-4 py-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="bg-card rounded-xl border border-destructive/40 p-6 text-center">
              <AlertCircleIcon className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-destructive mb-2">
                Error Loading File
              </h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header backHref="/files" />
        <main className="grow container mx-auto px-4 py-8 flex items-center justify-center">
          <LoadingIndicator loading="file details" />
        </main>
      </div>
    );
  }

  const downloadUrl = `${
    window.location.origin
  }/api/download?filename=${encodeURIComponent(fileName)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <Header
        backHref="/files"
        title={fileName}
        actions={[
          {
            icon: CopyIcon,
            label: "Copy Link",
            tooltip: copied ? "Copied!" : "Copy Link",
            disabled: copied,
            onClick: () => copyToClipboard(downloadUrl),
          },
          {
            icon: DownloadIcon,
            label: "Download File",
            tooltip: "Download File",
            onClick: () => handleDownload(fileName),
          },
        ]}
      />

      <main className="grow container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* File Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="relative bg-card rounded-2xl border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="p-3 sm:p-4 bg-accent rounded-xl">
                <FileTypeIcon className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-lg sm:text-2xl font-bold mb-2 wrap-break-word px-2 sm:px-0">
                  {fileDetails?.name}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <FileStatsIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">
                      {fileType.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <DatabaseIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">
                      {formatFileSize(fileDetails?.size || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* File Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="relative bg-card rounded-2xl border">
            <div className="border-b p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold">File Details</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-medium text-base sm:text-lg flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    Time Information
                  </h3>
                  <div className="space-y-2">
                    <DetailRow
                      label="Last Modified"
                      value={new Date(
                        fileDetails?.updatedAt || "",
                      ).toLocaleString()}
                    />
                    {fileDetails?.timeCreated && (
                      <DetailRow
                        label="Created"
                        value={new Date(
                          fileDetails.timeCreated,
                        ).toLocaleString()}
                      />
                    )}
                  </div>
                </div>

                {/* Technical Details */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-medium text-base sm:text-lg flex items-center gap-2">
                    <FileIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    Technical Details
                  </h3>
                  <div className="space-y-2">
                    {fileDetails?.contentType && (
                      <DetailRow
                        label="MIME Type"
                        value={fileDetails.contentType}
                      />
                    )}
                    <DetailRow label="File Extension" value={fileExtension} />
                    <DetailRow
                      label="File Type"
                      value={
                        fileType.charAt(0).toUpperCase() +
                        fileType.slice(1).toLowerCase()
                      }
                    />
                    {fileDetails?.size && (
                      <DetailRow
                        label="Size in Bytes"
                        value={fileDetails.size.toString()}
                      />
                    )}
                  </div>
                </div>

                {/* Download Link */}
                <div className="md:col-span-2 space-y-3 sm:space-y-4">
                  <h3 className="font-medium text-base sm:text-lg flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    Download Link
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-accent rounded-lg">
                    <div className="w-full sm:flex-1 break-all font-mono text-xs sm:text-sm">
                      {downloadUrl}
                    </div>
                    <Button
                      onClick={() => copyToClipboard(downloadUrl)}
                      variant="outline"
                      className={cn(
                        "w-full sm:w-auto transition-all duration-300",
                        copied
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : "hover:border-foreground/40",
                      )}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}

function DetailRow({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <span className="text-sm text-muted-foreground" title={tooltip}>
        {label}:
      </span>
      <span className="font-medium break-all">{value}</span>
    </div>
  );
}
