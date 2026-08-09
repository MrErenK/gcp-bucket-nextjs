"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DirectLinkUploader } from "./DirectLinkUploader";
import { useState } from "react";

export function FileUploader({
  onUploadCompleteAction,
}: {
  onUploadCompleteAction: (file: { name: string; url: string }) => void;
}) {
  const [directLinkError, setDirectLinkError] = useState<string | null>(null);

  const handleDirectLinkSuccess = (file: { name: string; url: string }) => {
    onUploadCompleteAction(file);
    setDirectLinkError(null);
  };

  const handleDirectLinkError = (error: string) => {
    setDirectLinkError(error);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="relative rounded-2xl border overflow-hidden bg-card">
        <div className="px-6 py-8 sm:px-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mb-8"
          >
            <h2 className="text-3xl font-bold text-center">Upload Files</h2>
          </motion.div>

          <DirectLinkUploader
            onUploadSuccessAction={handleDirectLinkSuccess}
            onUploadErrorAction={handleDirectLinkError}
          />

          <AnimatePresence>
            {directLinkError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="mt-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/5 rounded-2xl blur-lg" />
                  <div className="relative p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-center text-destructive">
                      {directLinkError}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
