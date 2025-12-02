import { create } from "zustand";

interface VideoState {
  // Video element
  video: HTMLVideoElement | null;
  setVideo: (video: HTMLVideoElement | null) => void;

  // Playback state
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  progress: number;
  setProgress: (progress: number) => void;

  // Volume state
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;

  // Quality state
  qualities: Array<{ label: string; index: number }>;
  setQualities: (qualities: Array<{ label: string; index: number }>) => void;
  selectedQuality: string;
  setSelectedQuality: (selectedQuality: string) => void;

  // Loading state
  isBuffering: boolean;
  setIsBuffering: (isBuffering: boolean) => void;
  isInitializing: boolean;
  setIsInitializing: (isInitializing: boolean) => void;
  loadProgress: number;
  setLoadProgress: (loadProgress: number) => void;
  loadStartTime: number;
  setLoadStartTime: (loadStartTime: number) => void;

  // UI state
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
  showControls: boolean;
  setShowControls: (showControls: boolean) => void;

  // Location/GPS state
  coords: { lat: number | string; lng: number | string };
  setCoords: (coords: { lat: number | string; lng: number | string }) => void;
  distance: number | string;
  setDistance: (distance: number | string) => void;
  accuracy: number;
  setAccuracy: (accuracy: number) => void;
  timestamp: number;
  setTimestamp: (timestamp: number) => void;

  // Rotation state
  rotationAngle: number;
  setRotationAngle: (rotationAngle: number) => void;

  // Map state (for SimpleMap)
  hoverInfo: any;
  setHoverInfo: (hoverInfo: any) => void;
  mousePosition: { x: number; y: number };
  setMousePosition: (mousePosition: { x: number; y: number }) => void;
}

export const useVideoStore = create<VideoState>()((set) => ({
  // Video element
  video: null,
  setVideo: (video) => set({ video }),

  // Playback state
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  currentTime: 0,
  setCurrentTime: (currentTime) => set({ currentTime }),
  duration: 0,
  setDuration: (duration) => set({ duration }),
  progress: 0,
  setProgress: (progress) => set({ progress }),

  // Volume state
  volume: 0.5,
  setVolume: (volume) => set({ volume }),
  isMuted: true,
  setIsMuted: (isMuted) => set({ isMuted }),

  // Quality state
  qualities: [],
  setQualities: (qualities) => set({ qualities }),
  selectedQuality: "Auto",
  setSelectedQuality: (selectedQuality) => set({ selectedQuality }),

  // Loading state
  isBuffering: false,
  setIsBuffering: (isBuffering) => set({ isBuffering }),
  isInitializing: true,
  setIsInitializing: (isInitializing) => set({ isInitializing }),
  loadProgress: 0,
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  loadStartTime: Date.now(),
  setLoadStartTime: (loadStartTime) => set({ loadStartTime }),

  // UI state
  isFullscreen: false,
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  showControls: false,
  setShowControls: (showControls) => set({ showControls }),

  // Location/GPS state
  coords: { lat: 0, lng: 0 },
  setCoords: (coords) => set({ coords }),
  distance: 0,
  setDistance: (distance) => set({ distance }),
  accuracy: 0,
  setAccuracy: (accuracy) => set({ accuracy }),
  timestamp: 0,
  setTimestamp: (timestamp) => set({ timestamp }),

  // Rotation state
  rotationAngle: 0,
  setRotationAngle: (rotationAngle) => set({ rotationAngle }),

  // Map state
  hoverInfo: null,
  setHoverInfo: (hoverInfo) => set({ hoverInfo }),
  mousePosition: { x: 0, y: 0 },
  setMousePosition: (mousePosition) => set({ mousePosition }),
}));

// Individual hooks for accessing video store
export const useVideo = () => {
  const video = useVideoStore((state) => state.video);
  const setVideo = useVideoStore((state) => state.setVideo);
  return { video, setVideo };
};

export const usePlayback = () => {
  const isPlaying = useVideoStore((state) => state.isPlaying);
  const setIsPlaying = useVideoStore((state) => state.setIsPlaying);
  const currentTime = useVideoStore((state) => state.currentTime);
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);
  const duration = useVideoStore((state) => state.duration);
  const setDuration = useVideoStore((state) => state.setDuration);
  const progress = useVideoStore((state) => state.progress);
  const setProgress = useVideoStore((state) => state.setProgress);
  return {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    progress,
    setProgress,
  };
};

export const useVolume = () => {
  const volume = useVideoStore((state) => state.volume);
  const setVolume = useVideoStore((state) => state.setVolume);
  const isMuted = useVideoStore((state) => state.isMuted);
  const setIsMuted = useVideoStore((state) => state.setIsMuted);
  return { volume, setVolume, isMuted, setIsMuted };
};

export const useQuality = () => {
  const qualities = useVideoStore((state) => state.qualities);
  const setQualities = useVideoStore((state) => state.setQualities);
  const selectedQuality = useVideoStore((state) => state.selectedQuality);
  const setSelectedQuality = useVideoStore((state) => state.setSelectedQuality);
  return { qualities, setQualities, selectedQuality, setSelectedQuality };
};

export const useLoading = () => {
  const isBuffering = useVideoStore((state) => state.isBuffering);
  const setIsBuffering = useVideoStore((state) => state.setIsBuffering);
  const isInitializing = useVideoStore((state) => state.isInitializing);
  const setIsInitializing = useVideoStore((state) => state.setIsInitializing);
  const loadProgress = useVideoStore((state) => state.loadProgress);
  const setLoadProgress = useVideoStore((state) => state.setLoadProgress);
  const loadStartTime = useVideoStore((state) => state.loadStartTime);
  const setLoadStartTime = useVideoStore((state) => state.setLoadStartTime);
  return {
    isBuffering,
    setIsBuffering,
    isInitializing,
    setIsInitializing,
    loadProgress,
    setLoadProgress,
    loadStartTime,
    setLoadStartTime,
  };
};

export const useVideoUI = () => {
  const isFullscreen = useVideoStore((state) => state.isFullscreen);
  const setIsFullscreen = useVideoStore((state) => state.setIsFullscreen);
  const showControls = useVideoStore((state) => state.showControls);
  const setShowControls = useVideoStore((state) => state.setShowControls);
  return { isFullscreen, setIsFullscreen, showControls, setShowControls };
};

export const useLocation = () => {
  const coords = useVideoStore((state) => state.coords);
  const setCoords = useVideoStore((state) => state.setCoords);
  const distance = useVideoStore((state) => state.distance);
  const setDistance = useVideoStore((state) => state.setDistance);
  const accuracy = useVideoStore((state) => state.accuracy);
  const setAccuracy = useVideoStore((state) => state.setAccuracy);
  const timestamp = useVideoStore((state) => state.timestamp);
  const setTimestamp = useVideoStore((state) => state.setTimestamp);
  return {
    coords,
    setCoords,
    distance,
    setDistance,
    accuracy,
    setAccuracy,
    timestamp,
    setTimestamp,
  };
};

export const useRotation = () => {
  const rotationAngle = useVideoStore((state) => state.rotationAngle);
  const setRotationAngle = useVideoStore((state) => state.setRotationAngle);
  return { rotationAngle, setRotationAngle };
};

export const useMapState = () => {
  const hoverInfo = useVideoStore((state) => state.hoverInfo);
  const setHoverInfo = useVideoStore((state) => state.setHoverInfo);
  const mousePosition = useVideoStore((state) => state.mousePosition);
  const setMousePosition = useVideoStore((state) => state.setMousePosition);
  return { hoverInfo, setHoverInfo, mousePosition, setMousePosition };
};
