"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import { cn } from "@/lib/utils";

const Button = dynamic(() => import('@/components/ui/button').then(mod => mod.Button), { ssr: false });
const Input = dynamic(() => import('@/components/ui/input').then(mod => mod.Input), { ssr: false });
const UploadIcon = dynamic(() => import('@/components/Icons').then(mod => mod.UploadIcon), { ssr: false });
const LoadingIcon = dynamic(() => import('@/components/Icons').then(mod => mod.LoadingIcon), { ssr: false });

interface DirectLinkUploaderProps {
  apiKey: string;
  onUploadSuccess: (file: { name: string; url: string }) => void;
  onUploadError: (error: string) => void;
}

export function DirectLinkUploader({
  apiKey,
  onUploadSuccess,
  onUploadError,
}: DirectLinkUploaderProps) {
  const [directLink, setDirectLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!directLink) return;

    setIsUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ directLink }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      onUploadSuccess(data.file);
      setDirectLink("");
    } catch (error) {
      onUploadError((error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {apiKey && (
        <motion.div
          key="direct-link-uploader"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <h3 className="text-lg font-semibold mb-2">
            Upload from Direct Link
          </h3>
          <div className="flex flex-col space-y-2">
            <Input
              type="text"
              placeholder="Enter direct download link"
              value={directLink}
              onChange={(e) => setDirectLink(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <Button
              onClick={handleUpload}
              disabled={isUploading || !directLink}
              className={cn(
                "w-full py-4 font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out",
                directLink && !isUploading
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <LoadingIcon className="mr-3 h-6 w-6 animate-spin" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <UploadIcon className="w-6 h-6 mr-2" /> Upload from Link
                </span>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
