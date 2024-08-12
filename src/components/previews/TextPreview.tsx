import React, { useState } from "react";
import { CopyIcon } from "../Icons";

interface TextPreviewProps {
  content: string;
}

export function TextPreview({ content }: TextPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleCopy}
          className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Copy to clipboard"
        >
          <CopyIcon className={`w-5 h-5 ${copied ? "text-green-500" : ""}`} />
        </button>
      </div>
      <pre className="p-6 overflow-x-auto whitespace-pre-wrap text-sm font-mono max-h-[60vh] text-gray-800 dark:text-gray-200 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-700">
        {content}
      </pre>
    </div>
  );
}
