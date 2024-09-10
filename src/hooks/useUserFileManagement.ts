"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface File {
  name: string;
  updatedAt: string;
  downloads: number;
  size: number;
  views: number;
  uploadedKey: string | null;
}

export function useUserFileManagement() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!session?.user?.apiKey) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/user-files`, {
        headers: {
          "x-api-key": session.user.apiKey,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Invalid API key");
        }
        throw new Error("Failed to fetch files");
      }
      const data = await response.json();
      setFiles(data.files);
      setTotalFiles(data.totalFiles);
      setTotalSize(data.totalSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching files");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.apiKey && files.length === 0) {
      fetchFiles();
    }
  }, [session, fetchFiles, files.length]);

  const handleDelete = useCallback(
    async (filename: string) => {
      try {
        const response = await fetch(
          `/api/user-delete?filename=${encodeURIComponent(filename)}`,
          {
            method: "POST",
            headers: {
              "x-api-key": session?.user.apiKey || "",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to delete file");
        }

        toast.success("File deleted successfully");
        fetchFiles();
      } catch (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete file. Please try again.");
      }
    },
    [session?.user.apiKey, fetchFiles],
  );

  const handleRename = useCallback(
    async (oldFilename: string, newFilename: string) => {
      try {
        const response = await fetch("/api/user-rename", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": session?.user.apiKey || "",
          },
          body: JSON.stringify({
            oldFilename,
            newFilename,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to rename file");
        }

        toast.success("File renamed successfully");
        fetchFiles();
      } catch (error) {
        console.error("Error renaming file:", error);
        toast.error("Failed to rename file. Please try again.");
      }
    },
    [session?.user.apiKey, fetchFiles],
  );

  const mostDownloadedFile = useMemo(() => {
    return files.reduce(
      (most, file) => (most.downloads > file.downloads ? most : file),
      files[0],
    );
  }, [files]);

  const leastDownloadedFile = useMemo(() => {
    return files.reduce(
      (least, file) => (least.downloads < file.downloads ? least : file),
      files[0],
    );
  }, [files]);

  const mostViewedFile = useMemo(() => {
    return files.reduce(
      (most, file) => (most.views > file.views ? most : file),
      files[0],
    );
  }, [files]);

  const leastViewedFile = useMemo(() => {
    return files.reduce(
      (least, file) => (least.views < file.views ? least : file),
      files[0],
    );
  }, [files]);

  const handleRefresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  return {
    files,
    totalFiles,
    totalSize,
    mostDownloadedFile,
    leastDownloadedFile,
    mostViewedFile,
    leastViewedFile,
    loading,
    error,
    fetchFiles,
    handleDelete,
    handleRename,
    isLoggedIn,
    setIsLoggedIn,
    handleRefresh,
  };
}
