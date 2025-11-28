// @ts-nocheck
"use client";
import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Hls from "hls.js";
import { XR, createXRStore } from "@react-three/xr";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Loader2,
  Maximize,
  Minimize,
  Clock,
  MapPin,
} from "lucide-react";
import { VideoSphere } from "./VideoSphere";
import { ProgressBar } from "./ProgressBar";
import MetadataPopover from "./metadata-popover";
import { MetadataColumn } from "./metadata-column";
import Image from "next/image";
import { RotationTracker } from "./RotationTracker";

const store = createXRStore();

export const VideoPlayer = ({
  url,
  video,
  setVideo,
  initialTimestamp = 1,
  locationData = [],
  createdAt,
  onRotationChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [qualities, setQualities] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState("Auto");
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [distance, setDistance] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStartTime, setLoadStartTime] = useState(Date.now());
  const containerRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);

  // Calculate distance between two coordinates
  const calcDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371e3;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lng2 - lng1);
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Update geolocation data based on current video time
  useEffect(() => {
    if (!video || !locationData?.length) return;

    const updateLocation = () => {
      const t = video.currentTime;

      // Find two surrounding points
      let prev = locationData[0];
      let next = locationData[locationData.length - 1];

      for (let i = 0; i < locationData.length - 1; i++) {
        if (
          parseFloat(locationData[i].timeStamp) <= t &&
          t <= parseFloat(locationData[i + 1].timeStamp)
        ) {
          prev = locationData[i];
          next = locationData[i + 1];
          break;
        }
      }

      const ratio =
        (t - parseFloat(prev.timeStamp)) /
        (parseFloat(next.timeStamp) - parseFloat(prev.timeStamp));

      const lat =
        parseFloat(prev.Latitude) +
        ratio * (parseFloat(next.Latitude) - parseFloat(prev.Latitude));
      const lng =
        parseFloat(prev.Longitude) +
        ratio * (parseFloat(next.Longitude) - parseFloat(prev.Longitude));

      setCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) });

      // Calculate distance from start point
      const dist = calcDistance(
        parseFloat(locationData[0].Latitude),
        parseFloat(locationData[0].Longitude),
        lat,
        lng
      );
      setDistance(dist.toFixed(1));
    };

    // Update location when video time changes
    const handleTimeUpdate = () => updateLocation();
    const handleSeeked = () => updateLocation();

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeked", handleSeeked);

    // Initial update
    updateLocation();

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [video, locationData]);

  // Initialize video with optimized loading
  useEffect(() => {
    if (video) return;

    const videoEl = document.createElement("video");
    videoEl.crossOrigin = "anonymous";
    videoEl.playsInline = true;
    videoEl.volume = volume;
    videoEl.muted = true; // Ensure video starts unmuted
    videoEl.preload = "metadata"; // Only load metadata initially

    if (Hls.isSupported()) {
      const hls = new Hls({
        // Optimized HLS configuration for faster initial loading
        maxBufferSize: 10, // Reduced from 30
        autoStartLoad: true,
        maxMaxBufferLength: 30, // Reduced from 60
        maxBufferLength: 20, // New: limit buffer length
        maxBufferHole: 0.5, // New: reduce buffer holes
        highBufferWatchdogPeriod: 2, // New: faster buffer monitoring
        nudgeOffset: 0.1, // New: reduce nudge offset
        nudgeMaxRetry: 3, // New: limit retry attempts
        maxFragLookUpTolerance: 0.25, // New: faster fragment lookup
        liveSyncDurationCount: 1, // New: reduce live sync
        liveMaxLatencyDurationCount: 2, // New: reduce latency
        // Preloading optimizations
        startLevel: -1, // Start with lowest quality for faster initial load
        capLevelToPlayerSize: true, // Limit quality to player size
        startFragPrefetch: true, // Prefetch first fragment
      });
      hls.loadSource(url);
      hls.attachMedia(videoEl);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((level, idx) => ({
          label: level.height + "p",
          index: idx,
        }));
        setQualities([{ label: "Auto", index: -1 }, ...levels]);
        // Switch to auto quality after initial load
        setTimeout(() => {
          hls.currentLevel = -1;
        }, 2000);
      });
      videoEl.hls = hls;
    } else {
      videoEl.src = url;
    }

    setVideo(videoEl);

    // Start playing when video is ready
    videoEl.addEventListener("loadedmetadata", () => {
      setIsInitializing(false);
      setLoadProgress(100);
      const loadTime = Date.now() - loadStartTime;
      console.log(`Video loaded in ${loadTime}ms`); // Performance logging
      // Set initial timestamp if provided
      if (initialTimestamp > 0) {
        videoEl.currentTime = initialTimestamp;
      }
      // Auto-play when metadata is loaded
      videoEl.play().catch(console.warn);
    });

    // Track loading progress
    videoEl.addEventListener("loadstart", () => {
      setIsInitializing(true);
      setLoadProgress(0);
      setLoadStartTime(Date.now());
    });

    videoEl.addEventListener("progress", () => {
      if (videoEl.buffered.length > 0) {
        const bufferedEnd = videoEl.buffered.end(videoEl.buffered.length - 1);
        const duration = videoEl.duration;
        if (duration > 0) {
          setLoadProgress((bufferedEnd / duration) * 100);
        }
      }
    });

    videoEl.addEventListener("canplay", () => {
      setLoadProgress(100);
    });

    return () => {
      videoEl.remove();
    };
  }, [url, video, setVideo]);

  const togglePlay = () => {
    if (!video) return;
    // Use the actual video element's paused state instead of React state
    if (video.paused) {
      video.play().catch(console.warn);
    } else {
      // Robust pause implementation
      video.pause();

      // If using HLS, also pause the HLS instance
      if (video.hls && typeof video.hls.stopLoad === "function") {
        video.hls.stopLoad();
        setTimeout(() => {
          if (video.hls && typeof video.hls.startLoad === "function") {
            video.hls.startLoad();
          }
        }, 100);
      }

      // Force ensure the video is actually paused
      setTimeout(() => {
        if (!video.paused) {
          console.warn(
            "Video still playing after pause command, forcing pause"
          );
          video.pause();
          // Also try setting currentTime to force a stop
          const currentTime = video.currentTime;
          video.currentTime = currentTime;
        }
      }, 50);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space" && video) {
        e.preventDefault(); // Prevent page scroll
        togglePlay();
      } else if (e.code === "KeyF" && video) {
        e.preventDefault(); // Prevent browser's default fullscreen
        toggleFullscreen();
      } else if (e.code === "KeyK" && video) {
        e.preventDefault(); // K key also toggles play/pause (YouTube style)
        togglePlay();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [video, togglePlay, toggleFullscreen]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  // Handle mouse movement and show/hide controls
  const handleMouseMove = () => {
    setShowControls(true);

    // Clear existing timeout
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    // Set new timeout to hide controls after 3 seconds of inactivity
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (!isPlaying) return; // Keep controls visible when paused
      setShowControls(false);
    }, 3000);
  };

  const handleMouseEnter = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    if (!isPlaying) return; // Keep controls visible when paused
    setShowControls(false);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
  };

  // Show controls when video is paused
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    }
  }, [isPlaying]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  const toggleMute = () => {
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (percent) => {
    setProgress(percent);
    if (video?.duration) video.currentTime = (percent / 100) * video.duration;
  };

  const handleVolumeChange = (v) => {
    setVolume(v);
    if (video) video.volume = v;
    setIsMuted(v === 0);
  };

  useEffect(() => {
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      setProgress(
        video.duration ? (video.currentTime / video.duration) * 100 : 0
      );
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
      // Double-check that video is actually paused
      if (!video.paused) {
        console.warn("Video pause event fired but video is still playing");
        video.pause();
      }
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateTime);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("canplaythrough", handleCanPlay);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateTime);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("canplaythrough", handleCanPlay);
    };
  }, [video]);

  const formatTime = (t) => {
    if (!t) return "0:00";
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#111",
        cursor: showControls ? "default" : "none",
      }}
    >
      <div onClick={togglePlay} style={{ width: "100%", height: "100%" }}>
        <Canvas
          camera={{ position: [0, 0, 0.1], fov: 75 }}
          dpr={[1, 2]} // Limit pixel ratio for better performance
          performance={{ min: 0.5 }} // Reduce frame rate when needed
          gl={{
            antialias: false, // Disable antialiasing for better performance
            alpha: false,
            powerPreference: "high-performance",
          }}
        >
          <XR store={store}>
            <OrbitControls enableZoom={false} enablePan={false} />
            {onRotationChange && (
              <RotationTracker onRotationChange={onRotationChange} />
            )}
            <Suspense fallback={null}>
              {video && <VideoSphere video={video} />}
            </Suspense>
          </XR>
        </Canvas>
      </div>

      {/* Geolocation Info Popover */}
      <MetadataPopover>
        <div className="space-y-2 text-sm text-neutral-700">
          {/* Lat / Lng */}
          <MetadataColumn
            icon={
              <Image
                src={"/location.svg"}
                alt="Location"
                width={16}
                height={16}
              />
            }
            data={`${coords.lat}, ${coords.lng}`}
          />

          {/* Date */}
          <MetadataColumn
            icon={
              <Image
                src={"/calendar.svg"}
                alt="Calendar"
                width={16}
                height={16}
              />
            }
            data={new Date(createdAt).toISOString().split("T")[0]}
          />

          {/* Time */}
          <MetadataColumn
            icon={
              <Image
                src={"/calendar.svg"}
                alt="Calendar"
                width={16}
                height={16}
              />
            }
            data={new Date(createdAt).toISOString().split("T")[1].slice(0, 5)}
          />
        </div>
      </MetadataPopover>

      {/* Initial Loading Screen */}
      {isInitializing && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/90 text-white z-50 gap-4">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-white rounded-full animate-spin" />
          <div className="text-center">
            <div className="text-xl font-semibold mb-2">
              Loading Video Player
            </div>
            <div className="text-sm text-gray-300 mb-3">
              Preparing your 360° experience...
            </div>
            <div className="w-64 bg-gray-700 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {Math.round(loadProgress)}% loaded
            </div>
          </div>
        </div>
      )}

      {/* Buffering Indicator */}
      {isBuffering && !isInitializing && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 text-white z-50 gap-3">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span>Buffering...</span>
        </div>
      )}

      {/* Controls */}
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
            }, 1000); // Shorter timeout when leaving controls area
          }
        }}
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

          <div className="flex items-center gap-2">
            {qualities.length > 0 && (
              <select
                value={selectedQuality}
                onChange={(e) => {
                  const idx = qualities.findIndex(
                    (q) => q.label === e.target.value
                  );
                  if (video?.hls) video.hls.currentLevel = qualities[idx].index;
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
          </div>
        </div>
      </div>
    </div>
  );
};
