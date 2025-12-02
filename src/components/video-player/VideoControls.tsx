"use client";
import { useRef, RefObject } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import VolumeProgressBar from "./VolumeProgressBar";
import {
  useVideo,
  usePlayback,
  useVolume,
  useQuality,
  useVideoUI,
} from "@/lib/video-store";
import { formatTime } from "@/lib/utils";

const VideoControls = ({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) => {
  const { video } = useVideo();
  const { isPlaying, currentTime, duration } = usePlayback();
  const { volume, isMuted } = useVolume();
  const { qualities, selectedQuality, setSelectedQuality } = useQuality();
  const { isFullscreen, showControls, setShowControls } = useVideoUI();

  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const togglePlay = () => {
    if (!video) return;
    if (video.paused) {
      video.play().catch(console.warn);
    } else {
      video.pause();

      if (video.hls && typeof video.hls.stopLoad === "function") {
        video.hls.stopLoad();
        setTimeout(() => {
          if (video.hls && typeof video.hls.startLoad === "function") {
            video.hls.startLoad();
          }
        }, 100);
      }

      setTimeout(() => {
        if (!video.paused) {
          console.warn(
            "Video still playing after pause command, forcing pause"
          );
          video.pause();
          const currentTime = video.currentTime;
          video.currentTime = currentTime;
        }
      }, 50);
    }
  };

  const toggleMute = () => {
    if (!video) return;
    video.muted = !video.muted;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).mozRequestFullScreen) {
        (containerRef.current as any).mozRequestFullScreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = qualities.findIndex((q) => q.label === e.target.value);
    if (video?.hls) {
      video.hls.currentLevel = qualities[idx].index;
    }
    setSelectedQuality(e.target.value);
  };

  return (
    <div
      className={`absolute bottom-3 left-0 w-full p-3 bg-black/60 backdrop-blur-sm flex flex-col gap-2 z-50 transition-all duration-300 ${
        showControls
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => {
        setShowControls(true);
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current);
        }
      }}
      onMouseLeave={() => {
        if (isPlaying) {
          hideControlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 1000);
        }
      }}
    >
      <ProgressBar />

      <div className="flex justify-between items-center text-white text-sm mt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full hover:bg-white/20 transition"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-white/20 transition"
          >
            <VolumeIcon size={16} />
          </button>
          <VolumeProgressBar />
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {qualities.length > 0 && (
            <select
              value={selectedQuality}
              onChange={handleQualityChange}
              className="bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-600"
            >
              {qualities.map((q) => (
                <option key={q.label} value={q.label}>
                  {q.label}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-white/20 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
