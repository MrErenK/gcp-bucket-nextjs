export function FilePreviewSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* File Details Section Skeleton */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="border-b p-6">
          <div className="h-8 bg-muted rounded-lg w-36 animate-pulse" />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-accent rounded-xl border p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <div className="w-5 h-5 bg-muted-foreground/20 rounded animate-pulse" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                    <div className="h-5 bg-muted rounded w-32 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File Preview Section Skeleton */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="border-b p-6">
          <div className="h-8 bg-muted rounded-lg w-36 animate-pulse" />
        </div>
        <div className="p-6">
          <div className="rounded-xl border overflow-hidden">
            <div className="aspect-video bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
