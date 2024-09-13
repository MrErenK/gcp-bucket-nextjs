"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TextPreview } from "@/components/previews/TextPreview";
import { ImagePreview } from "@/components/previews/ImagePreview";
import { AudioPreview } from "@/components/previews/AudioPreview";
import { VideoPreview } from "@/components/previews/VideoPreview";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { getFileType } from "@/types/filetypes";
import { useFileManagement } from "@/hooks/useFileManagement";
import dynamic from "next/dynamic";
import Loading from "@/app/loading";

const ThemeSwitch = dynamic(
  () => import("@/components/ThemeSwitch").then((mod) => mod.default),
  { ssr: false },
);
const CopyIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.CopyIcon),
  { ssr: false },
);
const Header = dynamic(() => import("./Header").then((mod) => mod.default), {
  ssr: false,
  loading: () => <Loading isLoading={true} />,
});

interface FileDetails {
  id: string;
  name: string;
  size: string;
  modifiedTime: string;
  mimeType: string;
  downloads: number;
  views: number;
  uploadedKey: string | null;
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
  const { handleDownload, handleCopy } = useFileManagement();
  const [loading, setLoading] = useState(true);

  const fileId = decodeURIComponent(params.filename);

  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground";

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        const response = await fetch(`/api/files?fileId=${fileId}`);
        if (!response.ok) throw new Error("Failed to fetch file details");
        const data = await response.json();
        setFileDetails(data);
      } catch (err) {
        setError("Failed to load file details");
      }
    };

    const fetchPreviewData = async () => {
      try {
        const response = await fetch(`/api/preview?fileId=${fileId}`);
        if (!response.ok) throw new Error("Failed to fetch preview data");
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
  }, [fileId]);

  function formatFileSize(bytes: string) {
    const parsedBytes = parseInt(bytes, 10);
    if (parsedBytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(parsedBytes) / Math.log(k));
    return (
      parseFloat((parsedBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  }

  function renderPreview() {
    if (!previewData) return null;

    if (previewData.content) {
      return <TextPreview content={previewData.content} />;
    }

    if (previewData.previewUrl) {
      const fileType = getFileType(fileDetails?.name.split(".").pop() || "");
      switch (fileType) {
        case "image":
          return (
            <ImagePreview
              src={previewData.previewUrl}
              alt={fileDetails?.name || ""}
            />
          );
        case "audio":
          return <AudioPreview src={previewData.previewUrl} />;
        case "video":
          return <VideoPreview src={previewData.previewUrl} />;
        default:
          return (
            <div className="flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16">
              <p className="text-center text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-md">
                Preview is not available for this file type. Please download to
                view its contents.
              </p>
            </div>
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

  function handleFilenameCopy(filename: string) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(`${filename}`)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    } else {
      // Fallback for browsers that don't support the Clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = `${filename}`;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }
      document.body.removeChild(textArea);
    }
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
        handleCopy={() => handleCopy(fileDetails?.name || "")}
        handleDownload={() => handleDownload(fileId)}
        copied={copied}
      />
      <div className="flex justify-end p-4 sm:p-6">
        <ThemeSwitch />
      </div>
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
        <div className="bg-card rounded-xl shadow-lg border border-primary/10 overflow-hidden">
          <div className="bg-primary/5 border-b border-primary/10 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary text-center">
              File Details
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  label: "File Name",
                  value: fileDetails?.name,
                  isCopyable: true,
                },
                {
                  label: "File Size",
                  value: formatFileSize(fileDetails?.size || "0"),
                },
                {
                  label: "Last Modified",
                  value: new Date(
                    fileDetails?.modifiedTime || "",
                  ).toLocaleString(),
                },
                {
                  label: "File Type",
                  value: fileDetails?.mimeType,
                },
                {
                  label: "Downloads",
                  value: fileDetails?.downloads || 0,
                },
                {
                  label: "Views",
                  value: fileDetails?.views || 0,
                },
                {
                  label: "Uploaded with API Key:",
                  value: fileDetails?.uploadedKey || "Unknown",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="space-y-2 bg-primary/5 p-3 sm:p-4 rounded-lg"
                >
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-xs sm:text-sm lg:text-base truncate flex-grow">
                      {item.value}
                    </p>
                    {item.isCopyable && (
                      <Button
                        onClick={() => {
                          handleFilenameCopy(item.value || "");
                        }}
                        variant="ghost"
                        size="sm"
                        className={`${buttonClasses} p-1 hover:bg-primary/10 ml-2`}
                        disabled={copied}
                      >
                        <CopyIcon
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${copied ? "text-green-500" : ""}`}
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
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary text-center">
              File Preview
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="max-w-full sm:max-w-4xl mx-auto">
              {renderPreview()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
