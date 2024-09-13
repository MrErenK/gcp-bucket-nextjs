"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useFileManagement } from "@/hooks/useFileManagement";

const ThemeSwitch = dynamic(
  () => import("@/components/ThemeSwitch").then((mod) => mod.default),
  { ssr: false },
);
const HomeIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.HomeIcon),
  { ssr: false },
);
const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.Card),
  { ssr: false },
);
const CardContent = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardContent),
  { ssr: false },
);
const CardHeader = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardHeader),
  { ssr: false },
);
const CardTitle = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardTitle),
  { ssr: false },
);
const LoadingIndicator = dynamic(
  () =>
    import("@/components/LoadingIndicator").then((mod) => mod.LoadingIndicator),
  { ssr: false },
);
const FileContent = dynamic(
  () => import("@/components/FileManager").then((mod) => mod.FileContent),
  { ssr: false, loading: () => <LoadingIndicator loading="files" /> },
);

const FilesPage = () => {
  const [error, setError] = useState(null);
  const {
    files,
    loading,
    initialLoadDone,
    fetchFiles,
    handleCopy,
    handleDownload,
    totalFiles,
    totalSize,
    setDisabledPagination,
  } = useFileManagement(true);
  const router = useRouter();

  useEffect(() => {
    setDisabledPagination(true);
    fetchFiles();
  }, [fetchFiles, setDisabledPagination]);

  const handleRefresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <header className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 bg-card shadow-md">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary/10 rounded-full w-full sm:w-auto mb-2 sm:mb-0"
        >
          <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="text-sm sm:text-base">Home</span>
        </Button>
        <div className="flex-shrink-0 mt-2 sm:mt-0">
          <ThemeSwitch />
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-12 sm:px-6 lg:px-8 max-w-4xl">
        <Card className="shadow-lg border border-primary/10 rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10 p-4 sm:p-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center sm:text-left text-primary flex items-center justify-between">
              File Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <LoadingIndicator loading="files" />
            ) : error ? (
              <p className="text-destructive text-center py-4">{error}</p>
            ) : (
              <FileContent
                loading={loading}
                initialLoadDone={initialLoadDone}
                files={files.map((file) => ({
                  id: file.id,
                  name: file.name,
                  updatedAt: file.modifiedTime,
                  downloads: file.downloads || 0,
                  size:
                    typeof file.size === "string"
                      ? parseInt(file.size, 10)
                      : file.size || 0,
                  uploadedKey: (file as any).uploadedKey || "",
                }))}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onRefresh={handleRefresh}
                totalFiles={totalFiles}
                totalSize={totalSize}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FilesPage;
