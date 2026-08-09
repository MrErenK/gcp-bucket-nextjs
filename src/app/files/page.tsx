"use client";
import React, { useEffect } from "react";
import { useFileManagement } from "@/hooks/useFileManagement";
import { SearchBar } from "@/components/ui/SearchBar";
import { FileContent } from "@/components/file/FileManager";
import { Header } from "@/components/layout/Header";
import { FileStatsIcon, DatabaseIcon } from "@/components/ui/Icons";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { formatFileSize } from "@/lib/utils";

const FilesPage = () => {
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
    searchTerm,
    handleSearch,
  } = useFileManagement(true);

  useEffect(() => {
    setDisabledPagination(true);
    fetchFiles();
  }, [fetchFiles, setDisabledPagination]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <Header />

      <main className="grow container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl sm:text-2xl font-bold tracking-tight mb-0"
              >
                File Manager
              </motion.h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="outline" className="text-xs sm:text-sm">
                <FileStatsIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                {totalFiles} files
              </Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">
                <DatabaseIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                {formatFileSize(totalSize)}
              </Badge>
            </div>
          </div>

          <SearchBar
            searchTerm={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="p-2 sm:p-4 md:p-6">
              <FileContent
                loading={loading}
                initialLoadDone={initialLoadDone}
                files={files.map((file) => ({
                  ...file,
                  name: file.name,
                  updatedAt: file.updatedAt,
                  size: file.size || 0,
                }))}
                onCopyAction={handleCopy}
                onDownloadAction={handleDownload}
                onRefreshAction={fetchFiles}
              />
            </div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default FilesPage;
