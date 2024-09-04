"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

const PlayIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.PlayIcon),
  { ssr: false },
);
const PauseIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.PauseIcon),
  { ssr: false },
);
const VolumeUpIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.VolumeUpIcon),
  { ssr: false },
);
const VolumeDownIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.VolumeDownIcon),
  { ssr: false },
);
const VolumeOffIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.VolumeOffIcon),
  { ssr: false },
);
const FullscreenIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.FullscreenIcon),
  { ssr: false },
);
const FullscreenExitIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.FullscreenExitIcon),
  { ssr: false },
);

interface VideoPreviewProps {
  src: string;
  poster?: string;
}

export function VideoPreview({ src, poster }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPendingPlay, setIsPendingPlay] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        if (!isPendingPlay) {
          setIsPendingPlay(true);
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Video playback started successfully
                setIsPlaying(true);
                setIsPendingPlay(false);
              })
              .catch((error) => {
                // Playback failed
                console.error("Error attempting to play video:", error);
                setIsPlaying(false);
                setIsPendingPlay(false);
              });
          } else {
            setIsPendingPlay(false);
          }
        }
      }
    }
  }, [isPlaying, isPendingPlay]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
    }
  }, []);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
      setCurrentTime(video.currentTime);
    }
  }, []);

  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const progressBar = progressRef.current;
      const video = videoRef.current;
      if (progressBar && video) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
      }
    },
    [],
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const skipTime = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime += seconds;
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const setVideoDuration = () => setDuration(video.duration);
      video.addEventListener("loadedmetadata", setVideoDuration);
      return () =>
        video.removeEventListener("loadedmetadata", setVideoDuration);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.code) {
        case "Space":
          togglePlay();
          break;
        case "ArrowLeft":
          skipTime(-5);
          break;
        case "ArrowRight":
          skipTime(5);
          break;
        case "ArrowUp":
          handleVolumeChange(Math.min(volume + 0.1, 1));
          break;
        case "ArrowDown":
          handleVolumeChange(Math.max(volume - 0.1, 0));
          break;
        case "KeyF":
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skipTime, handleVolumeChange, toggleFullscreen, volume]);

  return (
    <div
      ref={containerRef}
      className="bg-card p-4 rounded-lg shadow-md relative"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full max-h-[60vh] object-contain rounded-md"
        poster={poster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleProgress}
        onClick={togglePlay}
        autoPlay={false}
        playsInline
      >
        <source src={src} />
        Your browser does not support the video element.
      </video>
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 transition-opacity duration-300">
          <div
            ref={progressRef}
            className="h-1 bg-gray-300 rounded-full cursor-pointer"
            onClick={handleProgressBarClick}
          >
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlay}
                className="p-1 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
              </button>
              <span className="text-white text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVolumeChange(volume === 0 ? 1 : 0)}
                className="p-1 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                aria-label={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? (
                  <VolumeOffIcon size={16} />
                ) : volume < 0.5 ? (
                  <VolumeDownIcon size={16} />
                ) : (
                  <VolumeUpIcon size={16} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-16 accent-primary"
              />
              <button
                onClick={toggleFullscreen}
                className="p-1 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                aria-label={
                  isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"
                }
              >
                {isFullscreen ? (
                  <FullscreenExitIcon size={16} />
                ) : (
                  <FullscreenIcon size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
