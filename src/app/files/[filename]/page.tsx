"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "@/components/Icons";
import { TextPreview } from "@/components/previews/TextPreview";
import { ImagePreview } from "@/components/previews/ImagePreview";
import { AudioPreview } from "@/components/previews/AudioPreview";
import { VideoPreview } from "@/components/previews/VideoPreview";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { getFileType } from "@/types/filetypes";
import Header from "./Header";
import { useFileManagement } from "@/hooks/useFileManagement";

interface FileDetails {
  name: string;
  size: number;
  updatedAt: string;
}

interface PreviewData {
  content?: string;
  previewUrl?: string;
  fileType?: string;
}

export default function FilePage({ params }: { params: { filename: string } }) {
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { handleCopy, handleDownload } = useFileManagement();
  const [loading, setLoading] = useState(true);

  const fileName = decodeURIComponent(params.filename);
  const fileExtension = fileName
    .substring(fileName.lastIndexOf("."))
    .toLowerCase();
  const fileType = getFileType(fileExtension);

  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground";

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
      }
    };

    const fetchPreviewData = async () => {
      try {
        const response = await fetch(
          `/api/preview?filename=${encodeURIComponent(fileName)}`,
        );
        if (!response.ok) throw new Error("Failed to fetch file preview");
        const data = await response.json();
        setPreviewData(data);
      } catch (err) {
        setError("Failed to load file preview");
      } finally {
        setLoading(false);
      }
    };

    fetchFileDetails();
    fetchPreviewData();
  }, [fileName]);

  function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function renderPreview() {
    if (!previewData) return null;

    if (previewData.content) {
      return <TextPreview content={previewData.content} />;
    }

    if (previewData.previewUrl) {
      switch (fileType) {
        case "image":
          return <ImagePreview src={previewData.previewUrl} alt={fileName} />;
        case "audio":
          return <AudioPreview src={previewData.previewUrl} />;
        case "video":
          return <VideoPreview src={previewData.previewUrl} />;
        default:
          return (
            <p className="text-gray-600 dark:text-gray-400">
              Preview is not available for this file type. Please download to
              view its contents.
            </p>
          );
      }
    }

    return (
      <p className="text-gray-600 dark:text-gray-400">
        This file type cannot be previewed. Please download to view its
        contents.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background/80">
        <LoadingIndicator loading="file details" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <Header
        handleCopy={() => handleCopy(fileName)}
        handleDownload={() => handleDownload(fileName)}
        copied={copied}
      />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-card rounded-xl shadow-lg border border-primary/10 overflow-hidden">
          <div className="bg-primary/5 border-b border-primary/10 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-primary text-center">
              File Details
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "File Name",
                  value: fileDetails?.name,
                  isCopyable: true,
                },
                {
                  label: "File Size",
                  value: formatFileSize(fileDetails?.size || 0),
                },
                {
                  label: "Last Modified",
                  value: new Date(
                    fileDetails?.updatedAt || "",
                  ).toLocaleString(),
                },
                {
                  label: "File Type",
                  value: fileType.charAt(0).toUpperCase() + fileType.slice(1),
                },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-sm sm:text-base truncate">
                      {item.value}
                    </p>
                    {item.isCopyable && (
                      <Button
                        onClick={() => {
                          navigator.clipboard
                            .writeText(fileName)
                            .then(() => {
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            })
                            .catch(() => setError("Failed to copy filename"));
                        }}
                        variant="ghost"
                        size="sm"
                        className={`${buttonClasses} p-1 hover:bg-primary/10`}
                        disabled={copied}
                      >
                        <CopyIcon
                          className={`w-4 h-4 ${copied ? "text-green-500" : ""}`}
                        />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-primary/10 overflow-hidden">
          <div className="bg-primary/5 border-b border-primary/10 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-primary text-center">
              File Preview
            </h2>
          </div>
          <div className="p-4 sm:p-6">{renderPreview()}</div>
        </div>
      </main>
    </div>
  );
}
