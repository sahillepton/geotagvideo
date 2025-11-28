// @ts-nocheck
"use client";
import dynamic from "next/dynamic";
import { VideoWithMap } from "./VideoWithMap";

// Export the main component with dynamic import for SSR
export default dynamic(() => Promise.resolve(VideoWithMap), { ssr: false });

// Export individual components for direct use if needed
export { VideoPlayer } from "./VideoPlayer";
export { SimpleMap } from "./SimpleMap";
export { VideoSphere } from "./VideoSphere";
export { ProgressBar } from "./ProgressBar";
export { VideoProgressBar } from "./VideoProgressBar";
export { VolumeProgressBar } from "./VolumeProgressBar";
