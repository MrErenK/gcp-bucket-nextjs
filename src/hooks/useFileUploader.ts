// hooks/useFileUploader.ts
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function useFileUploader(onUploadComplete: () => void) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 3 * 1024 * 1024 * 1024, // 3 GB
    onDropRejected: () =>
      setError("File is too large. Please upload a file smaller than 3 GB."),
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    if (!apiKey) {
      setError("API key is required.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
        },
        body: formData,
      });

      if (response.ok) {
        setFiles([]);
        await onUploadComplete();
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while uploading the file.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return {
    files,
    uploading,
    error,
    apiKey,
    setApiKey,
    getRootProps,
    getInputProps,
    isDragActive,
    handleUpload,
    handleRemoveFile,
  };
}
