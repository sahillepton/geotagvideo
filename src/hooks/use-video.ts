import Hls from "hls.js";
import { useEffect, useState } from "react";

import { useRef } from "react";

export function useVideo(url: string, initialTimestamp = 1) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [qualities, setQualities] = useState<{ label: string; index: number }[]>([]);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    console.log("inside use video")

    const videoEl = videoRef.current;
    videoEl.crossOrigin = "anonymous";
    videoEl.playsInline = true;
    videoEl.volume = volume;
    videoEl.muted = isMuted;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoEl);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((l, idx) => ({ label: l.height + "p", index: idx }));
        setQualities([{ label: "Auto", index: -1 }, ...levels]);
      });
      (videoEl as any).hls = hls;
    } else {
      videoEl.src = url;
    }

    videoEl.addEventListener("loadedmetadata", () => {
      if (initialTimestamp > 0) videoEl.currentTime = initialTimestamp;
      videoEl.play().catch(console.warn);
    });

    const updateTime = () => {
      setCurrentTime(videoEl.currentTime);
      setDuration(videoEl.duration);
      setProgress((videoEl.currentTime / videoEl.duration) * 100);
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
      videoEl.remove();
    };
  }, [url]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) videoRef.current.play().catch(console.warn);
    else videoRef.current.pause();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleSeek = (percent: number) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    videoRef.current.currentTime = (percent / 100) * videoRef.current.duration;
  };

  const handleVolumeChange = (v: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = v;
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
