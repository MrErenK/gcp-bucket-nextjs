"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  ArrowLeftIcon,
  CopyIcon,
  HomeIcon,
} from "@/components/Icons";
import { TextPreview } from "@/components/previews/TextPreview";
import { ImagePreview } from "@/components/previews/ImagePreview";
import { AudioPreview } from "@/components/previews/AudioPreview";
import { VideoPreview } from "@/components/previews/VideoPreview";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { getFileType } from "@/types/filetypes";

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
  const router = useRouter();
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileName = decodeURIComponent(params.filename);
  const fileExtension = fileName
    .substring(fileName.lastIndexOf("."))
    .toLowerCase();
  const fileType = getFileType(fileExtension);

  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground";

  const handleDownload = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_WEB_URL}/api/download?filename=${encodeURIComponent(fileName)}`;

      // Fetch the file content
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;

      // Append to the document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke the blob URL to free up resources
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      setError("Failed to download file");
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(
        `${process.env.NEXT_PUBLIC_WEB_URL}/api/download?filename=${encodeURIComponent(fileName)}`,
      )
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => setError("Failed to copy filename"));
  };

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
        setIsLoading(false);
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

  if (isLoading) {
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
      <header className="flex justify-between items-center p-4 bg-card shadow-md">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className={buttonClasses}
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button
            onClick={() => router.push("/files")}
            variant="outline"
            className={buttonClasses}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex items-center gap-3 mr-2">
          <Button
            onClick={() => {
              handleCopy();
            }}
            variant="default"
            className={buttonClasses}
            disabled={copied}
          >
            <CopyIcon className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleDownload}
            variant="default"
            className={buttonClasses}
          >
            <DownloadIcon className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
            File Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                File Name:
              </p>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-sm sm:text-base truncate max-w-[180px] sm:max-w-[220px] lg:max-w-full">
                  {fileDetails?.name}
                </p>
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
                  className={`${buttonClasses} p-1`}
                  disabled={copied}
                >
                  <CopyIcon
                    className={`w-4 h-4 ${copied ? "text-green-500" : ""}`}
                  />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                File Size:
              </p>
              <p className="font-medium text-sm sm:text-base">
                {formatFileSize(fileDetails?.size || 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last Modified:
              </p>
              <p className="font-medium text-sm sm:text-base">
                {new Date(fileDetails?.updatedAt || "").toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                File Type:
              </p>
              <p className="font-medium text-sm sm:text-base">
                {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
            File Preview
          </h2>
          {renderPreview()}
        </div>
      </main>
    </div>
  );
}
