import useMaintenance from "@/hooks/useMaintenance";

export function MaintenanceContent() {
  const { reasonForMaintenance } = useMaintenance();
  const reason = reasonForMaintenance || "No reason provided";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-lg border border-primary/10 overflow-hidden w-full max-w-2xl">
        <div className="bg-primary/5 border-b border-primary/10 p-6">
          <h2 className="text-2xl md:text-3xl text-primary text-center">
            Maintenance in Progress
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-lg text-center">
            We&apos;re currently performing some maintenance on our site. Our
            team (literally one person) is working hard to improve our services.
            We&apos;ll be back online shortly.
          </p>
          <p className="text-lg text-center">
            Reason for maintenance: <strong>{reason}</strong>
          </p>
          <p className="text-md text-muted-foreground text-center">
            Thank you for your patience and understanding.
          </p>
        </div>
      </div>
    </div>
  );
}
