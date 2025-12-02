"use client";
import { useRef } from "react";
import { usePlayback, useVideo } from "@/lib/video-store";

interface VideoProgressBarProps {
  className?: string;
}

const VideoProgressBar = ({ className = "" }: VideoProgressBarProps) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const { progress, setProgress } = usePlayback();
  const { video } = useVideo();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !video) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;

    // Update progress for video seek
    setProgress(percentage);
    if (video.duration) {
      video.currentTime = (percentage / 100) * video.duration;
    }
  };

  return (
    <div
      ref={progressRef}
      className={`relative w-full h-2 bg-gray-600 rounded-full cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div
        className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
      <div
        className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-150 hover:scale-110"
        style={{ left: `calc(${progress}% - 6px)` }}
      />
    </div>
  );
};

export default VideoProgressBar;
