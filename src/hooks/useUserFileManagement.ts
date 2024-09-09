"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { verifyApiKey } from "@/lib/apiKeyAuth";

interface File {
  name: string;
  updatedAt: string;
  downloads: number;
  size: number;
  views: number;
  uploadedKey: string | null;
}

export function useUserFileManagement() {
  const [files, setFiles] = useState<File[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const cachedFiles = useRef<File[]>([]);

  const fetchFiles = useCallback(
    async (forceRefresh = false) => {
      if (!apiKey || !isLoggedIn) {
        setError("No valid API key available");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/user-files`, {
          headers: {
            "x-api-key": apiKey,
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
        cachedFiles.current = data.files;
        setTotalFiles(data.totalFiles);
        setTotalSize(data.totalSize);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching files");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [apiKey, isLoggedIn],
  );

  useEffect(() => {
    if (apiKey && isLoggedIn) {
      fetchFiles();
    }
  }, [apiKey, isLoggedIn, fetchFiles]);

  const login = useCallback(
    async (key: string) => {
      try {
        const isValid = await verifyApiKey(key);
        if (isValid) {
          setApiKey(key);
          setIsLoggedIn(true);
          localStorage.setItem("apiKey", key);
          toast.success("Logged in successfully, fetching your files...");
          fetchFiles(true);
          return true;
        } else {
          setApiKey(null);
          setIsLoggedIn(false);
          localStorage.removeItem("apiKey");
          toast.error("Invalid API key, please check your key and try again.");
          return false;
        }
      } catch (error) {
        console.error("Error verifying API key:", error);
        setApiKey(null);
        setIsLoggedIn(false);
        localStorage.removeItem("apiKey");
        toast.error("Error verifying API key, please try again.");
        return false;
      }
    },
    [fetchFiles],
  );

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      login(storedApiKey);
    }
  }, [login]);

  const handleDelete = useCallback(
    async (filename: string) => {
      try {
        const response = await fetch(
          `/api/user-delete?filename=${encodeURIComponent(filename)}`,
          {
            method: "POST",
            headers: {
              "x-api-key": apiKey || "",
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
    [apiKey, fetchFiles],
  );

  const handleRename = useCallback(
    async (oldFilename: string, newFilename: string) => {
      try {
        const response = await fetch("/api/user-rename", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey || "",
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
    [apiKey, fetchFiles],
  );

  return {
    files,
    totalFiles,
    totalSize,
    loading,
    error,
    fetchFiles,
    handleDelete,
    handleRename,
    login,
    isLoggedIn,
    setIsLoggedIn,
  };
}
