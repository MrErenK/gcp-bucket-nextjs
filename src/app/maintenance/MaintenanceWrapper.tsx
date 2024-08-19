import { Suspense } from "react";
import MaintenancePage from "./MaintenancePage";
import { LoadingIndicator } from "@/components/LoadingIndicator";

export default function MaintenanceWrapper() {
  const reasonForMaintenance = process.env.REASON_FOR_MAINTENANCE || null;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80">
          <LoadingIndicator loading="maintenance page" />
        </div>
      }
    >
      <MaintenancePage reasonForMaintenance={reasonForMaintenance} />
    </Suspense>
  );
}
