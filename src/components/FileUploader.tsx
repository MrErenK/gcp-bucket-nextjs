import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, MotionProps } from "framer-motion";

const MAX_FILE_SIZE = 2.5 * 1024 * 1024 * 1024; // 2.5GB
const ALLOWED_FILE_TYPES = "*"; // Allow all file types

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
}

export default function FileUploader({ onUpload }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File ${file.name} is too large. Max size is 2.5GB.`);
          return false;
        }
        return true;
      });
      onUpload(validFiles);
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 ${
        isDragActive
          ? "border-primary-light dark:border-primary-dark bg-primary-light bg-opacity-10 dark:bg-opacity-10"
          : "border-gray-300 dark:border-gray-600 hover:border-primary-light dark:hover:border-primary-dark"
      }`}
    >
      <div
        {...getRootProps()}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <input {...getInputProps()} />
        <p className="text-secondary-light dark:text-secondary-dark">
          {isDragActive
            ? "Drop the files here"
            : "Drag & drop files here, or click to select files"}
        </p>
      </div>
    </motion.div>
  );
}
