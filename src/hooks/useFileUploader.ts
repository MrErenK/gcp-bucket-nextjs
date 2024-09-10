import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useSession } from "next-auth/react";

interface UploadedFile {
  name: string;
  url: string;
}

export function useFileUploader(
  onUploadComplete: (uploadedFiles: UploadedFile[]) => void,
) {
  const { data: session } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [useCustomApiKey, setUseCustomApiKey] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    setError(null);
    setUploadSuccess(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 6 * 1024 * 1024 * 1024, // 6 GB
    onDropRejected: () =>
      setError("File is too large. Please upload a file smaller than 6 GB."),
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    const currentApiKey = useCustomApiKey ? apiKey : session?.user?.apiKey;
    if (!currentApiKey) {
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
          "x-api-key": currentApiKey,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.files && Array.isArray(data.files)) {
          setUploadSuccess(
            `Successfully uploaded ${data.files.length} file(s).`,
          );
          onUploadComplete(data.files);
        } else {
          setError("Unexpected response format from server.");
        }
        setFiles([]);
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
  };

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
    useCustomApiKey,
    setUseCustomApiKey,
    getRootProps,
    getInputProps,
    isDragActive,
    handleUpload,
    handleRemoveFile,
  };
}
