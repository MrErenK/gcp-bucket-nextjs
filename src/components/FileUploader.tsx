"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, XIcon } from "./Icons";
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

    setUploading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
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
    <div className="flex flex-col gap-6 mb-6 w-full max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-2">Upload Files</h2>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out",
          isDragActive
            ? "border-blue-300 bg-blue-100"
            : "border-gray-200 hover:border-gray-500 hover:bg-gray-50/20"
        )}
      >
        <input {...getInputProps()} />
        <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
        <p className="text-sm text-gray-600 text-center">
          <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
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
            className="flex flex-wrap gap-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 border border-gray-200 flex-grow shadow-sm"
              >
                <p className="text-xs text-gray-700 truncate flex-grow">{file.name}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(file.name)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <XIcon className="w-4 h-4" />
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
          "w-full mt-2 transition-all duration-300 ease-in-out",
          files.length > 0 && !uploading
            ? "bg-blue-400 hover:bg-blue-500"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}
      >
        {uploading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </span>
        ) : (
          <>
            <UploadIcon className="w-5 h-5 mr-2" /> Upload
          </>
        )}
      </Button>
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
