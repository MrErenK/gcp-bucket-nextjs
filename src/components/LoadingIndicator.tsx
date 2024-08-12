import React from "react";
import { LoadingIcon } from "./Icons";

interface LoadingIndicatorProps {
  loading: string;
  className?: string;
  iconSize?: number;
  text?: string;
  iconColor?: string;
}

export function LoadingIndicator({
  loading,
  className = "",
  iconSize = 6,
  text = "text-gray-500 text-md ml-2",
  iconColor = "text-gray-500",
}: Readonly<LoadingIndicatorProps>) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
    >
      <LoadingIcon
        className={`w-${iconSize} h-${iconSize} ${iconColor} animate-spin`}
        aria-hidden="true"
      />
      <p className={text}>
        Loading {loading}
        <span className="sr-only">. Please wait.</span>
      </p>
    </div>
  );
}
