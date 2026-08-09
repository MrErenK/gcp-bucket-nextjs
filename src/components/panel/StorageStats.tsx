import { formatFileSize } from "@/lib/utils";
import { motion } from "framer-motion";
import { DatabaseIcon, FileStatsIcon } from "@/components/ui/Icons";

interface StorageStatsProps {
  totalSize: number;
  totalFiles: number;
}

export function StorageStats({ totalSize, totalFiles }: StorageStatsProps) {
  const maxStorage = 1024 * 1024 * 1024 * 1024; // 1TB in bytes
  const usagePercentage = (totalSize / maxStorage) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Storage Overview</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative bg-card rounded-xl border p-4 overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-accent border rounded-lg">
                <DatabaseIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="font-medium">{formatFileSize(totalSize)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercentage}%` }}
                  transition={{
                    duration: 1,
                    ease: "easeOut",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(totalSize)} used</span>
                <span>{formatFileSize(maxStorage)} total</span>
              </div>
            </div>
          </div>

          <div className="relative bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent border rounded-lg">
                <FileStatsIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Files</p>
                <p className="font-medium">{totalFiles.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs text-muted-foreground">
                Average file size:{" "}
                <span className="font-medium">
                  {formatFileSize(totalFiles > 0 ? totalSize / totalFiles : 0)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
