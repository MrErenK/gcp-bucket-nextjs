"use client";

import React, { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import APIKeyCard from "@/components/APIKeyCard";
import dynamic from "next/dynamic";
import { useFileManagement } from "@/hooks/useFileManagement";
import { AdminFileList } from "./AdminFileList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { formatFileSize } from "@/lib/utils";

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
const PlusIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.PlusIcon),
  { ssr: false },
);
const LoadingIndicator = dynamic(
  () =>
    import("@/components/LoadingIndicator").then((mod) => mod.LoadingIndicator),
  { ssr: false },
);

interface MainPanelProps {
  newKeyDescription: string;
  setNewKeyDescription: (description: string) => void;
  generateNewKey: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  apiKeys: Array<{ key: string; id: string; description: string }> | null;
  deletingKey: { id: string; description: string } | null;
  setDeletingKey: (key: { id: string; description: string } | null) => void;
  deleteKey: (id: string) => Promise<void>;
}

export const MainPanel: React.FC<MainPanelProps> = ({
  newKeyDescription,
  setNewKeyDescription,
  generateNewKey,
  isLoading,
  error,
  apiKeys,
  deletingKey,
  setDeletingKey,
  deleteKey,
}) => {
  const { files, fetchFiles, totalFiles, totalSize } = useFileManagement();

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleRefresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  const handleGenerateNewKey = async () => {
    try {
      await generateNewKey();
      toast.success("New API key generated successfully");
    } catch (error) {
      toast.error("Failed to generate new API key");
    }
  };

  const handleDeleteKey = async () => {
    if (deletingKey) {
      try {
        await deleteKey(deletingKey.id);
        toast.success("API key deleted successfully");
        setDeletingKey(null);
      } catch (error) {
        toast.error("Failed to delete API key");
      }
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="mb-8 border border-primary/10 shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-3xl font-bold text-center sm:text-left text-primary">
              Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Enter new key description"
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                  className="pr-10 w-full rounded-lg border-2 border-primary/20 focus:border-primary focus:ring focus:ring-primary/30 transition-all duration-300"
                />
              </div>
              <Button
                onClick={handleGenerateNewKey}
                disabled={isLoading}
                className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary/90 rounded-lg px-6 py-3 bg-primary shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isLoading ? (
                  <LoadingIndicator loading="create" />
                ) : (
                  <span className="flex items-center justify-center text-primary-foreground">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Generate New Key
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-2xl font-semibold text-primary">
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingIndicator loading="keys" />
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            ) : (
              <div className="space-y-6">
                {Array.isArray(apiKeys) && apiKeys.length === 0 ? (
                  <p className="text-center text-muted-foreground text-lg">
                    No API keys found.
                  </p>
                ) : Array.isArray(apiKeys) ? (
                  apiKeys.map((key) => (
                    <div className="max-w-2xl mx-auto" key={key.id}>
                      <APIKeyCard
                        apiKey={key}
                        onDelete={() => setDeletingKey(key)}
                        toast={toast}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground text-lg">
                    Error: Unable to display API keys.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!deletingKey}
        onOpenChange={(open) => !open && setDeletingKey(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-center">
            Are you sure you want to delete the API key for{" "}
            <strong className="text-primary">{deletingKey?.description}</strong>
            ? This action is{" "}
            <strong className="text-destructive">irreversible</strong>.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingKey(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteKey}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border border-primary/10 shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-2xl font-semibold text-primary">
              File Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AdminFileList
              files={files.map((file) => ({
                name: file.name,
                updatedAt: file.updatedAt,
                downloads: file.downloads || 0,
                size: file.size || 0,
                uploadedKey: file.uploadedKey || null,
              }))}
              onCopy={() => {}}
              onDownload={() => {}}
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
    </main>
  );
};
