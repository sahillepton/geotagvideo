import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

export function useVideo(url: string, initialTimestamp = 1) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [qualities, setQualities] = useState<{ label: string; index: number }[]>([]);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    console.log("videoEl", videoEl);

    videoEl.playsInline = true;
    videoEl.volume = volume;
    videoEl.muted = isMuted;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoEl);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls!.levels.map((l, idx) => ({ label: l.height + "p", index: idx }));
        setQualities([{ label: "Auto", index: -1 }, ...levels]);
        if (initialTimestamp > 0) videoEl.currentTime = initialTimestamp;
        videoEl.play().catch(console.warn);
      });
    } else {
      videoEl.src = url;
      videoEl.addEventListener("loadedmetadata", () => {
        if (initialTimestamp > 0) videoEl.currentTime = initialTimestamp;
        videoEl.play().catch(console.warn);
      });
    }

    const updateTime = () => {
      setCurrentTime(videoEl.currentTime);
      setDuration(videoEl.duration || 0);
      setProgress((videoEl.currentTime / (videoEl.duration || 1)) * 100);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    videoEl.addEventListener("timeupdate", updateTime);
    videoEl.addEventListener("play", handlePlay);
    videoEl.addEventListener("pause", handlePause);
    videoEl.addEventListener("waiting", handleWaiting);
    videoEl.addEventListener("canplay", handleCanPlay);
    videoEl.addEventListener("canplaythrough", handleCanPlay);

    return () => {
      videoEl.removeEventListener("timeupdate", updateTime);
      videoEl.removeEventListener("play", handlePlay);
      videoEl.removeEventListener("pause", handlePause);
      videoEl.removeEventListener("waiting", handleWaiting);
      videoEl.removeEventListener("canplay", handleCanPlay);
      videoEl.removeEventListener("canplaythrough", handleCanPlay);
      if (hls) hls.destroy();
    };
  }, [url, initialTimestamp, volume, isMuted]);

  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (videoEl.paused) videoEl.play().catch(console.warn);
    else videoEl.pause();
  };

  const toggleMute = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.muted = !videoEl.muted;
    setIsMuted(videoEl.muted);
  };

  const handleSeek = (percent: number) => {
    const videoEl = videoRef.current;
    if (!videoEl || !videoEl.duration) return;
    videoEl.currentTime = (percent / 100) * videoEl.duration;
  };

  const handleVolumeChange = (v: number) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  };

  return {
    videoRef,
    isPlaying,
    togglePlay,
    volume,
    handleVolumeChange,
    isMuted,
    toggleMute,
    progress,
    handleSeek,
    currentTime,
    duration,
    qualities,
    isBuffering,
  };
}
