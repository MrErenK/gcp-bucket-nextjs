"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useFileUploader } from "@/hooks/useFileUploader";
import { APIKeyInput } from "./APIKeyInput";
import { DirectLinkUploader } from "./DirectLinkUploader";
import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";

const UploadIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.UploadIcon),
  { ssr: false },
);
const XIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.XIcon),
  { ssr: false },
);
const FileIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.FileIcon),
  { ssr: false },
);
const LoadingIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.LoadingIcon),
  { ssr: false },
);

export function FileUploader({
  onUploadComplete,
}: {
  onUploadComplete: () => void;
}) {
  const {
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
  } = useFileUploader(onUploadComplete);
  const [directLinkError, setDirectLinkError] = useState<string | null>(null);
  const [directLinkKey, setDirectLinkKey] = useState(0);

  const handleDirectLinkError = (error: string) => {
    setDirectLinkError(error);
  };

  const handleDirectLinkUploadSuccess = useCallback(() => {
    onUploadComplete();
    setDirectLinkKey((prevKey) => prevKey + 1);
  }, [onUploadComplete]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-8 lg:mb-12 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-primary items-center justify-center">
          Upload Files
        </h2>

        <div className="mb-4 sm:mb-6 lg:mb-8">
          <APIKeyInput apiKey={apiKey} setApiKey={setApiKey} />
        </div>

        <AnimatePresence mode="wait">
          {apiKey && (
            <motion.div
              key="file-uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {!files.length ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-48 sm:h-56 lg:h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ease-in-out",
                    isDragActive
                      ? "border-primary bg-primary/10"
                      : "border-input hover:border-primary hover:bg-accent/50",
                  )}
                >
                  <input {...getInputProps()} />
                  <UploadIcon className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-3 sm:mb-4 lg:mb-5 text-muted-foreground" />
                  <p className="text-sm sm:text-base lg:text-lg text-foreground text-center items-center justify-center">
                    <span className="font-semibold text-primary">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">
                    Max file size: 6 GB
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mt-4 sm:mt-6 lg:mt-8">
                    {files.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center gap-3 sm:gap-4 bg-card rounded-lg p-3 sm:p-4 border border-input shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <FileIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary flex-shrink-0" />
                        <p className="text-sm sm:text-base text-foreground truncate flex-grow">
                          {file.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(file.name)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                          aria-label={`Remove ${file.name}`}
                        >
                          <XIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 sm:mt-6 lg:mt-8 flex justify-center">
                    <Button
                      onClick={handleUpload}
                      disabled={files.length === 0 || uploading}
                      className={cn(
                        "py-3 sm:py-4 lg:py-5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out",
                        files.length > 0 && !uploading
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "bg-muted text-muted-foreground cursor-not-allowed",
                      )}
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center">
                          <LoadingIcon className="mr-3 sm:mr-4 h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 animate-spin" />
                          <span className="text-center">Uploading...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <UploadIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3" />
                          <span className="text-center">Upload Files</span>
                        </span>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 text-sm sm:text-base mt-2 sm:mt-3"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {apiKey && (
          <DirectLinkUploader
            key={directLinkKey}
            apiKey={apiKey}
            onUploadSuccess={handleDirectLinkUploadSuccess}
            onUploadError={handleDirectLinkError}
          />
        )}
        {directLinkError && (
          <p className="text-red-500 text-sm sm:text-base mt-2 sm:mt-3">
            {directLinkError}
          </p>
        )}

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 text-sm sm:text-base mt-2 sm:mt-3"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
