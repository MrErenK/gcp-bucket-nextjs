import React from "react";
import { LoadingIcon } from "./Icons";

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
  return (
    <div
      className={`flex items-center justify-center space-x-2 ${className}`}
      role="status"
    >
      <LoadingIcon
        className={`${iconSizes[iconSize]} text-primary animate-spin`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-muted-foreground">
        Loading {loading}
        <span className="sr-only">. Please wait.</span>
      </span>
    </div>
  );
}
