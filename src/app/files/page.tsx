"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileList } from "@/components/FileList";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/Icons";
import { ThemeSwitch } from "@/components/ThemeSwitch";

const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground";

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("/api/files");
        if (!response.ok) throw new Error("Failed to fetch files");

        const data = await response.json();
        setFiles(data.files);
      } catch (err) {
        console.error("Error fetching files:", err);
        setError("Failed to load files");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleCopy = (filename: string) => {
    navigator.clipboard
      .writeText(
        `${process.env.NEXT_PUBLIC_WEB_URL}/api/download?filename=${encodeURIComponent(filename)}`,
      )
      .catch(() => alert("Failed to copy URL"));
  };

  const handleDownload = async (filename: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WEB_URL}/api/download?filename=${encodeURIComponent(filename)}`,
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file");
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/files");
      if (!response.ok) throw new Error("Failed to refresh files");

      const data = await response.json();
      setFiles(data.files);
    } catch (err) {
      console.error("Error refreshing files:", err);
      setError("Failed to refresh files");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <header className="flex justify-between items-center p-4 bg-card shadow-md">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className={buttonClasses}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        <ThemeSwitch />
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <LoadingIndicator loading="files" />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <FileList
            files={files}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onRefresh={handleRefresh}
          />
        )}
      </main>
    </div>
  );
};

export default FilesPage;
