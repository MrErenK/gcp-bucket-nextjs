import React, { useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useFileManagement } from "@/hooks/useFileManagement";
import { formatFileSize } from "@/lib/utils";

const LoadingIndicator = dynamic(
  () =>
    import("@/components/LoadingIndicator").then((mod) => mod.LoadingIndicator),
  { ssr: false },
);
const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.Card),
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
const CardContent = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardContent),
  { ssr: false },
);
const AdminFileList = dynamic(
  () => import("@/components/AdminFileList").then((mod) => mod.AdminFileList),
  { ssr: false, loading: () => <LoadingIndicator loading="files" /> },
);

export default function AdminFileManager() {
  const { files, totalFiles, totalSize, fetchFiles } = useFileManagement(true);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleRefresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="border border-primary/10 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardContent className="p-6">
          <AdminFileList
            files={files.map((file) => ({
              id: file.id,
              name: file.name,
              updatedAt: file.modifiedTime,
              downloads: file.downloads || 0,
              size:
                typeof file.size === "string"
                  ? parseInt(file.size, 10)
                  : file.size || 0,
              uploadedKey: file.uploadedKey || null,
            }))}
            onRefresh={handleRefresh}
            totalFiles={totalFiles}
            totalSize={totalSize}
          />
        </CardContent>
        <div className="bg-primary/5 px-6 py-4 border-t border-primary/10">
          <div className="flex justify-between items-center text-sm text-primary">
            <span>Total Files: {totalFiles}</span>
            <span>Total Size: {formatFileSize(totalSize)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
