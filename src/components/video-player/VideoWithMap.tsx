"use client";
import { useMemo } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import VideoPlayer from "./VideoPlayer";
import Map from "@/components/map";
import { useVideo } from "@/lib/video-store";

declare global {
  interface Window {
    google: any;
  }
}

const VideoWithMap = ({
  videoUrl,
  locationData,
  initialX,
  initialY,
  createdAt,
  state,
}: {
  videoUrl: string;
  locationData: any[];
  initialX: number;
  initialY: number;
  createdAt: string;
  state: string;
}) => {
  const { video } = useVideo();

  const sortedData = useMemo(() => {
    if (!locationData || !Array.isArray(locationData)) return [];

    const sorted = locationData.sort(
      (a, b) => parseFloat(a.timeStamp) - parseFloat(b.timeStamp)
    );
    console.log("Sorted data:", sorted);
    return sorted;
  }, [locationData]);

  let initialTimestamp = 0;
  if (
    initialX !== undefined &&
    initialY !== undefined &&
    sortedData?.length &&
    typeof window !== "undefined" &&
    window.google?.maps
  ) {
    let closestPoint = sortedData[0];
    let minDistance = Infinity;

    try {
      sortedData.forEach((point) => {
        if (point.Latitude && point.Longitude) {
          const pointLatLng = new window.google.maps.LatLng(
            parseFloat(point.Latitude),
            parseFloat(point.Longitude)
          );
          const initialLatLng = new window.google.maps.LatLng(
            initialY,
            initialX
          ); // Note: Y is lat, X is lng
          const distance =
            window.google.maps.geometry.spherical.computeDistanceBetween(
              initialLatLng,
              pointLatLng
            );

          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        }
      });

      initialTimestamp = closestPoint?.timeStamp
        ? parseFloat(closestPoint.timeStamp)
        : 0;
    } catch (error) {
      console.error("Error finding closest GPS point:", error);
      initialTimestamp = 0;
    }
  }

  return (
    <PanelGroup
      direction="horizontal"
      style={{ width: "100%", height: "80vh" }}
    >
      <Panel defaultSize={50} minSize={30}>
        <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-300">
          <VideoPlayer
            url={videoUrl}
            initialTimestamp={initialTimestamp}
            locationData={sortedData}
            createdAt={createdAt}
          />
        </div>
      </Panel>
      <PanelResizeHandle className="w-2 cursor-col-resize bg-gray-200 hover:bg-gray-400 transition" />
      <Panel defaultSize={50} minSize={30}>
        <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-300">
          {video && (
            <Map data={sortedData} createdAt={createdAt} state={state} />
          )}
        </div>
      </Panel>
    </PanelGroup>
  );
};

export default VideoWithMap;
