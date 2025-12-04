//@ts-nocheck
"use client";
import React, { useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Hls from "hls.js";
import { XR, createXRStore } from "@react-three/xr";
import { Loader2 } from "lucide-react";
import VideoSphere from "./VideoSphere";
import VideoControls from "./VideoControls";
import MetadataPopover from "./metadata-popover";
import MetadataColumn from "./metadata-column";
import Image from "next/image";
import RotationTracker from "./RotationTracker";
import {
  useVideo,
  usePlayback,
  useVolume,
  useQuality,
  useLoading,
  useVideoUI,
  useLocation,
  useRotation,
} from "@/lib/video-store";
import { calcDistance } from "@/lib/utils";

const store = createXRStore();

const VideoPlayer = ({
  url,
  initialTimestamp = 1,
  locationData = [],
  createdAt,
}: {
  url: string;
  initialTimestamp: number;
  locationData: any[];
  createdAt: string;
}) => {
  // Use video store hooks
  const { video, setVideo } = useVideo();
  const {
    isPlaying,
    setIsPlaying,
    progress,
    setProgress,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
  } = usePlayback();
  const { volume, setVolume } = useVolume();
  const { qualities, setQualities } = useQuality();
  const {
    isBuffering,
    setIsBuffering,
    isInitializing,
    setIsInitializing,
    loadProgress,
    setLoadProgress,
    loadStartTime,
    setLoadStartTime,
  } = useLoading();
  const { isFullscreen, setIsFullscreen, showControls, setShowControls } =
    useVideoUI();
  const { coords, setCoords, distance, setDistance } = useLocation();
  const { rotationAngle, setRotationAngle } = useRotation();

  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      //    console.log(`Video loaded in ${loadTime}ms`); // Performance logging
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
  }, [url, video, setVideo, volume]);

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
            <RotationTracker />
            <Suspense fallback={null}>{video && <VideoSphere />}</Suspense>
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
      <VideoControls containerRef={containerRef} />
    </div>
  );
};

export default VideoPlayer;
