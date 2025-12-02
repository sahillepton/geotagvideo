"use client";
import { useRef } from "react";
import { useVolume, useVideo } from "@/lib/video-store";

interface VolumeProgressBarProps {
  className?: string;
}

const VolumeProgressBar = ({
  className = "",
}: VolumeProgressBarProps) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const { volume, setVolume, setIsMuted } = useVolume();
  const { video } = useVideo();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width; // Convert to 0-1 range

    setVolume(percentage);
    if (video) {
      video.volume = percentage;
      video.muted = percentage === 0;
      setIsMuted(percentage === 0);
    }
  };

  return (
    <div
      ref={progressRef}
      className={`relative w-20 h-2 bg-gray-600 rounded-full cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div
        className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-150"
        style={{ width: `${volume * 100}%` }}
      />
      <div
        className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-150 hover:scale-110"
        style={{ left: `calc(${volume * 100}% - 6px)` }}
      />
    </div>
  );
};

export default VolumeProgressBar;
