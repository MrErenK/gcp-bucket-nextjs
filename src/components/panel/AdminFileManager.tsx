"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useFileManagement } from "@/hooks/useFileManagement";
import { Card, CardContent } from "@/components/ui/card";
import { AdminFileList } from "@/components/panel/AdminFileList";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { motion } from "framer-motion";
import { StorageStats } from "@/components/panel/StorageStats";

export default function AdminFileManager() {
  const { files, totalFiles, totalSize, fetchFiles } = useFileManagement(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      await fetchFiles();
      setIsInitialLoading(false);
    };
    loadFiles();
  }, [fetchFiles]);

  const handleRefresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIndicator loading="files" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-10 md:py-12 lg:py-16"
    >
      <div className="relative">
        <Card className="relative bg-card border rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-foreground/25">
          <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
            <StorageStats totalSize={totalSize} totalFiles={totalFiles} />
            <div className="h-8" />
            <AdminFileList
              files={files.map((file) => ({
                name: file.name,
                updatedAt: file.updatedAt,
                size: file.size || 0,
              }))}
              onCopyAction={() => {}}
              onDownloadAction={() => {}}
              onRefreshAction={handleRefresh}
              totalFiles={totalFiles}
              totalSize={totalSize}
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
