"use client";

import dynamic from "next/dynamic";

const VideoWithMap = dynamic(() => import("../video-player"), {
  ssr: false,
  loading: () => (
    <div className="h-[80vh] flex items-center justify-center">
      Loading video...
    </div>
  ),
});

export default function VideoWithMapClient(props: any) {
  return <VideoWithMap {...props} />;
}
