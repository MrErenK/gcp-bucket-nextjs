import { useState } from "react";
import { cloudStorage } from "@/lib/cloudStorage";

export function useCloudStorage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapCloudStorageMethod = <T extends (...args: any[]) => Promise<any>>(
    method: T,
  ): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    return async (...args: Parameters<T>) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await method(...args);
        return result;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };
  };

  return {
    uploadFile: wrapCloudStorageMethod(cloudStorage.uploadFile),
    downloadFile: wrapCloudStorageMethod(cloudStorage.downloadFile),
    deleteFile: wrapCloudStorageMethod(cloudStorage.deleteFile),
    getFileMetadata: wrapCloudStorageMethod(cloudStorage.getFileMetadata),
    listFiles: wrapCloudStorageMethod(cloudStorage.listFiles),
    isLoading,
    error,
  };
}
