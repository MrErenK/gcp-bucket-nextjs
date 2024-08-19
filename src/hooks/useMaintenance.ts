export default function useMaintenance() {
  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const reasonForMaintenance = process.env.REASON_FOR_MAINTENANCE || "";
  const isMaintenance = maintenanceMode;
  return { isMaintenance, reasonForMaintenance };
}
