import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Clock, Loader2, MapPin, Pause, Play, VolumeIcon } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { createXRStore, XR } from "@react-three/xr";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const store = createXRStore();
const VideoSphere = ({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) => {
  const sphere = useRef(null);
  const texture = useMemo(
    () => new THREE.VideoTexture(videoRef.current as HTMLVideoElement),
    [videoRef]
  );

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  return (
    <mesh ref={sphere}>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial side={THREE.BackSide} map={texture} />
    </mesh>
  );
};

const ProgressBar = ({
  value,
  onChange,
  className = "",
  isVolume,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  isVolume?: boolean;
}) => {
  const progressRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    onChange(isVolume ? percentage / 100 : percentage);
  };

  return (
    <div
      ref={progressRef}
      className={`relative ${
        isVolume ? "w-20" : "w-full"
      } h-2 bg-gray-700 rounded-full cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div
        className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-150"
        style={{ width: `${isVolume ? value * 100 : value}%` }}
      />
      <div
        className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-150 hover:scale-125"
        style={{ left: `calc(${isVolume ? value * 100 : value}% - 6px)` }}
      />
    </div>
  );
};

const VideoPlayer = ({
  videoRef,
  isPlaying,
  togglePlay,
  isBuffering,
  progress,
  handleSeek,
  coords,
  createdAt,
  volume,
  handleVolumeChange,
  toggleMute,
  currentTime,
  duration,
  qualities,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  togglePlay: () => void;
  isBuffering: boolean;
  progress: number;
  handleSeek: (value: number) => void;
  coords: { lat: number; lng: number };
  createdAt: string;
  volume: number;
  handleVolumeChange: (value: number) => void;
  toggleMute: () => void;
  currentTime: number;
  duration: number;
  qualities: { label: string; index: number }[];
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#111",
      }}
    >
      <div onClick={togglePlay} style={{ width: "100%", height: "100%" }}>
        <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
          <XR store={store}>
            <OrbitControls enableZoom={false} enablePan={false} />
            <Suspense fallback={null}>
              {videoRef.current && <VideoSphere videoRef={videoRef} />}
            </Suspense>
          </XR>
        </Canvas>
      </div>

      {/* Geolocation Info Card */}
      <Card className="z-[9999] absolute top-2 left-2 shadow-lg rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-md">
        <CardContent className="pl-2 pr-2 pt-0 pb-0 text-sm text-neutral-700">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-500" />
            <span className="truncate">
              {coords.lat}, {coords.lng}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-500" />
            <span className="truncate">
              {new Date(createdAt).toISOString().split("T")[0]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-500" />
            <span className="truncate">
              {new Date(createdAt).toISOString().split("T")[1].slice(0, 5)}
            </span>
          </div>
        </CardContent>
      </Card>
      {isBuffering && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 text-white z-50 gap-3">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span>Buffering...</span>
        </div>
      )}

      <div
        className={
          "absolute bottom-3 left-0 w-full p-3 bg-black/60 backdrop-blur-sm flex flex-col gap-2 z-50 transition-all duration-300"
        }
      >
        <ProgressBar value={progress} onChange={handleSeek} />

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
            <ProgressBar
              value={volume}
              onChange={handleVolumeChange}
              isVolume
            />
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* <div className="flex items-center gap-2">
            {qualities.length > 0 && (
              <select
                value={selectedQuality}
                onChange={(e) => {
                  const idx = qualities.findIndex(
                    (q) => q.label === e.target.value
                  );
                  if (videoRef.current?.hls)
                    videoRef.current.hls.currentLevel = qualities[idx].index;
                  setSelectedQuality(e.target.value);
                }}
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
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
