"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, XIcon, FileIcon, LoadingIcon } from "./Icons";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function FileUploader({
  onUploadComplete,
}: {
  onUploadComplete: () => void;
}) {
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
        onUploadComplete();
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

  return (
    <div className="flex flex-col gap-8 mb-8 w-full max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center sm:text-left text-primary">
        Upload Files
      </h2>

      <div className="mb-6">
        <label
          htmlFor="apiKey"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          API Key
        </label>
        <input
          id="apiKey"
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="w-full p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 border border-gray-300"
        />
      </div>

      {apiKey && (
        <>
          <div
            {...getRootProps()}
            className={cn(
              "flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out",
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
            )}
          >
            <input {...getInputProps()} />
            <UploadIcon className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold text-blue-500">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {files.length > 0
                ? `${files.length} file(s) selected`
                : "Max file size: 3 GB"}
            </p>
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {files.map((file) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FileIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
                    <p className="text-sm text-gray-700 truncate flex-grow">
                      {file.name}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.name)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors p-2"
                    >
                      <XIcon className="w-5 h-5" />
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className={cn(
              "w-full py-4 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out",
              files.length > 0 && !uploading
                ? "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed",
            )}
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <LoadingIcon className="mr-3 h-6 w-6 text-white animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <UploadIcon className="w-6 h-6 mr-2" /> Upload Files
              </span>
            )}
          </Button>
        </>
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-500 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
