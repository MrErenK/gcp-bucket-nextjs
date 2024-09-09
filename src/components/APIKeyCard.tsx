"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.Card),
  { ssr: false },
);
const CardContent = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardContent),
  { ssr: false },
);
const TrashIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.TrashIcon),
  { ssr: false },
);
const EyeIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.EyeIcon),
  { ssr: false },
);
const EyeOffIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.EyeOffIcon),
  { ssr: false },
);
const CopyIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.CopyIcon),
  { ssr: false },
);

interface APIKeyCardProps {
  apiKey: any;
  onCopy?: (key: string) => void;
  onDelete: (id: string) => void;
  toast: any;
}

const APIKeyCard = ({ apiKey, onCopy, onDelete, toast }: APIKeyCardProps) => {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!window) return;
    const { clipboard } = window.navigator;
    if (!clipboard) return;
    clipboard.writeText(apiKey.key);
    setCopied(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy(apiKey.key);
  };

  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:text-primary-foreground";

  return (
    <Card className="w-full border border-primary/10 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-2">
          <p className="text-lg font-semibold mb-2 sm:mb-0">
            {apiKey.description}
          </p>
          <Button
            variant="destructive"
            size="sm"
            className={`${buttonClasses} hover:bg-destructive`}
            onClick={() => onDelete(apiKey.id)}
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-3">
          <p className="text-sm text-muted-foreground flex-grow break-all">
            Key: {showKey ? apiKey.key : "••••••••••••••••••••••••••••••••"}
          </p>
          <div className="flex space-x-2 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-primary/10"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${buttonClasses} hover:bg-primary`}
              onClick={handleCopy}
            >
              {copied ? (
                <span className="text-green-500">Copied</span>
              ) : (
                <>
                  <CopyIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIKeyCard;
