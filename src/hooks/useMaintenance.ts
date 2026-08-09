export default function useMaintenance() {
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  const reasonForMaintenance =
    process.env.NEXT_PUBLIC_REASON_FOR_MAINTENANCE || "";
  const isMaintenance = maintenanceMode;
  return { isMaintenance, reasonForMaintenance };
}
