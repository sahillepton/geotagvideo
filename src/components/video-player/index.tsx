"use client";
/// <reference types="@types/google.maps" />
import React, { useState, useMemo } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { useMap } from "@/hooks/use-map";
import { useMarkers } from "@/hooks/use-markers";
import { usePolylines } from "@/hooks/use-polylines";
import { useVideo } from "@/hooks/use-video";
import MapComponent from "./map-component";
import { useVideoGeolocation } from "@/hooks/use-videogeolocation";
import VideoPlayer from "./video-component";
import { getSmoothedPath } from "@/lib/utils";

declare global {
  interface Window {
    google: any;
  }
}

export default function VideoWithMap({
  videoUrl,
  locationData,
  initialX,
  initialY,
  createdAt,
  state,
}: {
  videoUrl: string;
  locationData: any[];
  initialX: string | undefined;
  initialY: string | undefined;
  createdAt: string;
  state: string;
}) {
  const [accuracy, setAccuracy] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [hoverInfo, setHoverInfo] = useState<{
    timestamp: string;
    lat: string;
    lng: string;
  } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const smoothedPath = useMemo(
    () => getSmoothedPath(locationData),
    [locationData]
  );

  const { mapRef } = useMap(locationData);
  const {
    videoRef,
    qualities,
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
    isBuffering,
  } = useVideo(videoUrl);

  const { coords, distance } = useVideoGeolocation(videoRef, locationData);

  const { endMarkerRef, startMarkerRef, movingMarkerRef } = useMarkers(
    mapRef,
    locationData[0],
    locationData[locationData.length - 1]
  );

  const { shadowPolylineRef, coveredPolylineRef, remainingPolylineRef } =
    usePolylines(
      smoothedPath,
      mapRef,
      movingMarkerRef,
      ({ x, y }) => setMousePosition({ x, y }),
      locationData,
      ({ timestamp, lat, lng }) => setHoverInfo({ timestamp, lat, lng }),
      () => setHoverInfo(null),
      videoRef
    );

  return (
    <PanelGroup
      direction="horizontal"
      style={{ width: "100%", height: "80vh" }}
    >
      <Panel defaultSize={50} minSize={30}>
        <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-300">
          <VideoPlayer
            videoRef={videoRef}
            coords={coords}
            createdAt={createdAt}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            isBuffering={isBuffering}
            progress={progress}
            handleSeek={handleSeek}
            volume={volume}
            handleVolumeChange={handleVolumeChange}
            toggleMute={toggleMute}
            currentTime={currentTime}
            duration={duration}
            qualities={qualities}
          />
        </div>
      </Panel>
      <PanelResizeHandle className="w-2 cursor-col-resize bg-gray-200 hover:bg-gray-400 transition" />
      <Panel defaultSize={50} minSize={30}>
        <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-300">
          <MapComponent
            mapRef={mapRef}
            timestamp={timestamp}
            coords={coords}
            distance={distance}
            createdAt={createdAt}
            state={state}
            accuracy={accuracy}
            hoverInfo={hoverInfo}
            mousePosition={mousePosition}
            locationData={locationData}
          />
        </div>
      </Panel>
    </PanelGroup>
  );
}
