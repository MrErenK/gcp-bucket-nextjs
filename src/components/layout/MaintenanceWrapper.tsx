"use client";
import { MaintenanceContent } from "@/components/ui/MaintenanceContent";
import useMaintenance from "@/hooks/useMaintenance";

export function MaintenanceWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMaintenance } = useMaintenance();

  if (isMaintenance) {
    return <MaintenanceContent />;
  }

  return <>{children}</>;
}
