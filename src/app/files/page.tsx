"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileList } from "@/components/FileList";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "@/components/Icons";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

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
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleCopy = useCallback((filename: string) => {
    navigator.clipboard
      .writeText(
        `${process.env.NEXT_PUBLIC_WEB_URL}/api/download?filename=${encodeURIComponent(filename)}`,
      )
      .then(() => alert("URL copied to clipboard"))
      .catch(() => alert("Failed to copy URL"));
  }, []);

  const handleDownload = useCallback(async (filename: string) => {
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
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <header className="flex justify-between items-center p-6 bg-card shadow-md">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary/10 rounded-full"
        >
          <HomeIcon className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Home</span>
        </Button>
        <ThemeSwitch />
      </header>
      <main className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl">
        <Card className="shadow-lg border border-primary/10 rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-3xl font-bold text-center sm:text-left text-primary flex items-center justify-between">
              File Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <LoadingIndicator loading="files" />
            ) : error ? (
              <p className="text-destructive text-center py-4">{error}</p>
            ) : (
              <FileList
                files={files}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onRefresh={fetchFiles}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FilesPage;
