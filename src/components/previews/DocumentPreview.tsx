import React from "react";

interface DocumentPreviewProps {
  src: string;
  type: string;
}

export function DocumentPreview({ src, type }: DocumentPreviewProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Document Preview ({type})
        </p>
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(src)}&embedded=true`}
            className="w-full h-full"
            title="Document Preview"
          />
        </div>
      </div>
      <div className="p-4 bg-gray-100 dark:bg-gray-700">
        <a
          href={src}
          download
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Download Document
        </a>
      </div>
    </div>
  );
}
