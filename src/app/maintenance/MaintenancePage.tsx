"use client";
import React from "react";
import { Toaster } from "react-hot-toast";
import { RefreshIcon } from "@/components/Icons";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

interface MaintenancePageProps {
  reasonForMaintenance: string | null;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({
  reasonForMaintenance,
}) => {
  const router = useRouter();
  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground";

  const handleRefresh = () => {
    router.push("/");
  };

  return (
    <>
      <Toaster position="top-right" />
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
        <div className="bg-card rounded-xl shadow-lg border border-primary/10 overflow-hidden w-full max-w-2xl">
          <div className="bg-primary/5 border-b border-primary/10 p-6">
            <h2 className="text-2xl md:text-3xl font-bold text-primary text-center">
              Maintenance in Progress
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <p className="text-lg text-center">
              We&apos;re currently performing some maintenance on our site. Our
              team (literally one person) is working hard to improve our
              services. We&apos;ll be back online shortly.
            </p>
            {reasonForMaintenance && (
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                <p className="text-sm font-medium text-primary">
                  Reason for maintenance:
                </p>
                <p className="text-base mt-1">{reasonForMaintenance}</p>
              </div>
            )}
            <p className="text-md text-muted-foreground text-center">
              Thank you for your patience and understanding.
            </p>
            <div className="flex items-center justify-center">
              <button
                onClick={handleRefresh}
                className={
                  buttonClasses +
                  " bg-primary text-primary-foreground rounded-lg px-4 py-2 flex items-center space-x-2"
                }
              >
                <RefreshIcon className="w-4 h-4" />
                <span>Refresh Page</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default MaintenancePage;
