import React from "react";
import { LoadingIcon } from "./Icons";

export function LoadingIndicator({ loading }: Readonly<{ loading: string }>) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <LoadingIcon className="w-6 h-6 text-gray-500 animate-spin" />
      <p className="text-gray-500">Loading {loading}...</p>
    </div>
  );
}
