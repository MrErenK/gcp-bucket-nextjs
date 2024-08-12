import React, { useState } from "react";

interface AudioPreviewProps {
  src: string;
  title?: string;
}

export function AudioPreview({ src, title }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-2">
        <button
          onClick={handlePlayPause}
          className="mr-3 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸" : "▶️"}
        </button>
        {title && (
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </p>
        )}
      </div>
      <audio
        controls
        className="w-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={src} />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
