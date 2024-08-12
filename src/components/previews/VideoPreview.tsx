import React, { useState } from "react";

interface VideoPreviewProps {
  src: string;
  poster?: string;
}

export function VideoPreview({ src, poster }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="relative">
        <video
          controls
          className="w-full max-h-[60vh] object-contain"
          poster={poster}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={src} />
          Your browser does not support the video element.
        </video>
      </div>
    </div>
  );
}
