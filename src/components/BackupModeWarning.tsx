"use client";
import { useEffect, useState } from "react";

const BackupModeWarning = () => {
  const [isBackupMode, setIsBackupMode] = useState(false);

  useEffect(() => {
    const checkBackupMode = async () => {
      try {
        const response = await fetch("/api/backup-mode");
        const data = await response.json();
        setIsBackupMode(data.isBackupMode);
      } catch (error) {
        console.error("Failed to check backup mode:", error);
      }
    };

    checkBackupMode();

    // Set up an interval to check periodically
    const interval = setInterval(checkBackupMode, 60000); // Check every minute

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  if (!isBackupMode) return null;

  return (
    <div className="bg-yellow-500 text-yellow-900 px-2 sm:px-4 py-2 sm:py-3 text-center">
      <p className="text-xs sm:text-sm md:text-base font-medium">
        Backup mode enabled. Some actions may be unavailable.
      </p>
    </div>
  );
};

export default BackupModeWarning;
