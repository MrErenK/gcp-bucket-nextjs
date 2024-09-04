"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

const EyeIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.EyeIcon),
  { ssr: false },
);
const EyeOffIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.EyeOffIcon),
  { ssr: false },
);

interface APIKeyInputProps {
  apiKey: string;
  setApiKey: (value: string) => void;
}

export const APIKeyInput: React.FC<APIKeyInputProps> = ({
  apiKey,
  setApiKey,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="mb-6">
      <label
        htmlFor="apiKey"
        className="block text-sm font-medium text-foreground mb-2"
      >
        API Key
      </label>
      <div className="relative">
        <input
          id="apiKey"
          type={showApiKey ? "text" : "password"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="w-full p-3 pr-10 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 border border-input bg-background text-foreground placeholder-muted-foreground"
          aria-describedby="apiKeyHelp"
        />
        <button
          type="button"
          onClick={() => setShowApiKey(!showApiKey)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label={showApiKey ? "Hide API Key" : "Show API Key"}
        >
          {showApiKey ? (
            <EyeOffIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <p id="apiKeyHelp" className="mt-2 text-sm text-muted-foreground">
        Your API key is securely stored and never shared.
      </p>
    </div>
  );
};
