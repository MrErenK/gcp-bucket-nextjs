import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function useFileUploader(onUploadComplete: () => void) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => {
      const newFiles = acceptedFiles.filter((newFile) => {
        const exists = prevFiles.some(
          (existingFile) => existingFile.name === newFile.name,
        );
        if (exists) {
          setError(`File "${newFile.name}" already exists in the upload list.`);
          return false;
        }
        return true;
      });
      return [...prevFiles, ...newFiles];
    });
    setUploadSuccess(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 6 * 1024 * 1024 * 1024, // 6 GB
    onDropRejected: () =>
      setError("File is too large. Please upload a file smaller than 6 GB."),
  });

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;
    if (!apiKey) {
      setError("API key is required.");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadSuccess(null);

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
        setUploading(false);
        setError(null);
        setUploadSuccess("Files uploaded successfully!");
        onUploadComplete();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Upload failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while uploading the file.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  }, [files, apiKey, onUploadComplete]);

  const handleRemoveFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return {
    files,
    uploading,
    error,
    uploadSuccess,
    apiKey,
    setApiKey,
    getRootProps,
    getInputProps,
    isDragActive,
    handleUpload,
    handleRemoveFile,
  };
}
