import React from "react";
import { LoadingIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  loading: string;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
}

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function LoadingIndicator({
  loading,
  className = "",
  iconSize = "md",
}: Readonly<LoadingIndicatorProps>) {
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 p-4",
        "bg-card rounded-xl",
        "border",
        "shadow-lg",
        className,
      )}
      role="status"
    >
      <LoadingIcon
        className={cn(iconSizes[iconSize], "text-primary animate-spin")}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-muted-foreground">
        Loading {loading}
        <span className="inline-flex">
          <span className="animate-pulse">.</span>
          <span className="animate-pulse delay-100">.</span>
          <span className="animate-pulse delay-200">.</span>
        </span>
      </span>
    </div>
  );
}
