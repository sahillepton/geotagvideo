// @ts-nocheck
"use client";
import { useRef, useState, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MapPin, Clock, Ruler, Crosshair } from "lucide-react";
import MetadataPopover from "./metadata-popover";
import { MetadataColumn } from "./metadata-column";
import Image from "next/image";

declare global {
  interface Window {
    google: any;
  }
}

export const SimpleMap = ({
  data,
  video,
  createdAt,
  state,
}: {
  data: any[];
  video: HTMLVideoElement | null;
  createdAt: string;
  state: string;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const movingMarkerRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const coveredPolylineRef = useRef<any>(null);
  const remainingPolylineRef = useRef<any>(null);
  const shadowPolylineRef = useRef<any>(null);
  const [map, setMap] = useState<any>(null);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [distance, setDistance] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const calcDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
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

  // Smooth GPS points for polyline
  const getSmoothedPath = (points: any[], windowSize = 3) => {
    return points.map((point, idx, arr) => {
      const start = Math.max(0, idx - Math.floor(windowSize / 2));
      const end = Math.min(arr.length, idx + Math.floor(windowSize / 2));
      const slice = arr.slice(start, end);
      const lat =
        slice.reduce((sum, p) => sum + parseFloat(p.Latitude), 0) /
        slice.length;
      const lng =
        slice.reduce((sum, p) => sum + parseFloat(p.Longitude), 0) /
        slice.length;
      return new window.google.maps.LatLng(lat, lng);
    });
  };

  // Initialize map and markers
  useEffect(() => {
    if (
      !mapRef.current ||
      map ||
      !data?.length ||
      typeof window === "undefined" ||
      !window.google
    )
      return;

    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];

    // Add a small delay to ensure the container is properly rendered
    const timer = setTimeout(() => {
      if (!mapRef.current) return;

      // Create Google Map
      const googleMap = new window.google.maps.Map(mapRef.current, {
        zoom: 18,
        center: {
          lat: parseFloat(firstPoint.Latitude),
          lng: parseFloat(firstPoint.Longitude),
        },
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.BOTTOM_RIGHT,
        },
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
        },
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMap(googleMap);

      // Create start marker with custom HTML
      const startMarker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(firstPoint.Latitude),
          lng: parseFloat(firstPoint.Longitude),
        },
        map: googleMap,
        title: "Start Point",
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="startGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#10B981" flood-opacity="0.4"/>
                </filter>
              </defs>
              <circle cx="16" cy="16" r="12" fill="url(#startGrad)" stroke="white" stroke-width="4" filter="url(#shadow)"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">S</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16),
        },
      });

      startMarkerRef.current = startMarker;

      // Create start label
      const startInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="
            background: rgba(16, 185, 129, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            text-align: center;
          ">START</div>
        `,
        disableAutoPan: true,
      });
      startInfoWindow.open(googleMap, startMarker);

      // Create end marker with custom HTML
      const endMarker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(lastPoint.Latitude),
          lng: parseFloat(lastPoint.Longitude),
        },
        map: googleMap,
        title: "End Point",
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="endGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#EF4444;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#DC2626;stop-opacity:1" />
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#EF4444" flood-opacity="0.4"/>
                </filter>
              </defs>
              <circle cx="16" cy="16" r="12" fill="url(#endGrad)" stroke="white" stroke-width="4" filter="url(#shadow)"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">E</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16),
        },
      });

      endMarkerRef.current = endMarker;

      // Create end label
      const endInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="
            background: rgba(239, 68, 68, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            text-align: center;
          ">END</div>
        `,
        disableAutoPan: true,
      });
      endInfoWindow.open(googleMap, endMarker);

      // Create moving marker as a blue circle
      const movingMarker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(firstPoint.Latitude),
          lng: parseFloat(firstPoint.Longitude),
        },
        map: googleMap,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="6" fill="#3B82F6" stroke="#3B82F6" stroke-width="2" fill-opacity="0.9"/>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(16, 16),
          anchor: new window.google.maps.Point(8, 8),
        },
      });

      movingMarkerRef.current = movingMarker;

      // Create covered and remaining route polylines
      const smoothedPath = getSmoothedPath(data);

      // Add shadow polyline
      const shadowPolyline = new window.google.maps.Polyline({
        path: smoothedPath,
        geodesic: true,
        strokeColor: "#1F2937",
        strokeOpacity: 0.3,
        strokeWeight: 8,
        map: googleMap,
        clickable: false,
      });

      shadowPolylineRef.current = shadowPolyline;

      // Create covered route polyline (initially empty)
      const coveredPolyline = new window.google.maps.Polyline({
        path: [],
        geodesic: true,
        strokeColor: "#10B981", // Green color for covered route
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map: googleMap,
        clickable: true, // Make it clickable for backward navigation
      });

      coveredPolylineRef.current = coveredPolyline;

      // Create remaining route polyline (initially full route)
      const remainingPolyline = new window.google.maps.Polyline({
        path: smoothedPath,
        geodesic: true,
        strokeColor: "#8B5CF6", // Purple color for remaining route
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map: googleMap,
        clickable: true,
        icons: [
          {
            icon: {
              path: "M 0,-1 0,1",
              strokeOpacity: 1,
              scale: 4,
            },
            offset: "0",
            repeat: "20px",
          },
        ],
      });

      remainingPolylineRef.current = remainingPolyline;

      // Store references for updating
      movingMarker.fullPath = smoothedPath;

      // Create a reusable click handler function
      const handleRouteClick = (event) => {
        const clickedLatLng = event.latLng;

        // Find the closest GPS point to the clicked location
        let closestPoint = data[0];
        let minDistance = Infinity;

        data.forEach((point) => {
          const pointLatLng = new window.google.maps.LatLng(
            parseFloat(point.Latitude),
            parseFloat(point.Longitude)
          );
          const distance =
            window.google.maps.geometry.spherical.computeDistanceBetween(
              clickedLatLng,
              pointLatLng
            );

          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        });

        // Jump to the timestamp of the closest point
        if (video && closestPoint) {
          let timestamp = null;

          if (closestPoint.timeStamp !== undefined) {
            timestamp = parseFloat(closestPoint.timeStamp);
          }

          if (timestamp !== null && !isNaN(timestamp)) {
            video.currentTime = timestamp;
          } else {
            console.error(
              "No valid timestamp found in closest point:",
              closestPoint
            );
          }
        }
      };

      // Store map reference for mouse events
      mapRef.current.addEventListener("mousemove", (e) => {
        const rect = mapRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      });

      // Create hover handler function
      const handleRouteHover = (event) => {
        const clickedLatLng = event.latLng;

        // Find the closest GPS point to the hovered location
        let closestPoint = data[0];
        let minDistance = Infinity;

        data.forEach((point) => {
          const pointLatLng = new window.google.maps.LatLng(
            parseFloat(point.Latitude),
            parseFloat(point.Longitude)
          );
          const distance =
            window.google.maps.geometry.spherical.computeDistanceBetween(
              clickedLatLng,
              pointLatLng
            );

          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        });

        if (closestPoint && closestPoint.timeStamp !== undefined) {
          const timestamp = parseFloat(closestPoint.timeStamp);
          const lat = parseFloat(closestPoint.Latitude).toFixed(6);
          const lng = parseFloat(closestPoint.Longitude).toFixed(6);

          // Format time
          const formatTime = (t) => {
            if (!t) return "0:00";
            const minutes = Math.floor(t / 60);
            const seconds = Math.floor(t % 60);
            return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
          };

          setHoverInfo({
            timestamp: formatTime(timestamp),
            lat,
            lng,
          });
        }
      };

      // Handle mouse leave to close tooltip
      const handleRouteMouseOut = () => {
        setHoverInfo(null);
      };

      // Add hover handlers to both polylines
      coveredPolyline.addListener("mouseover", handleRouteHover);
      coveredPolyline.addListener("mouseout", handleRouteMouseOut);
      remainingPolyline.addListener("mouseover", handleRouteHover);
      remainingPolyline.addListener("mouseout", handleRouteMouseOut);

      // Add click handler to both covered and remaining polylines
      coveredPolyline.addListener("click", handleRouteClick);
      remainingPolyline.addListener("click", handleRouteClick);

      // Fit map to show the whole route
      const bounds = new window.google.maps.LatLngBounds();
      smoothedPath.forEach((point) => bounds.extend(point));
      googleMap.fitBounds(bounds);
    }, 100);

    return () => {
      clearTimeout(timer);
      // Google Maps cleanup is handled automatically
    };
  }, [mapRef, map, data]);

  // Smooth marker movement with requestAnimationFrame
  useEffect(() => {
    if (!video || !map || !data?.length || typeof window === "undefined")
      return;

    let animationId: number;

    const updateMarker = () => {
      const t = video.currentTime;
      setTimestamp(t);

      // Find two surrounding points
      let prev = data[0];
      let next = data[data.length - 1];
      for (let i = 0; i < data.length - 1; i++) {
        if (
          parseFloat(data[i].timeStamp) <= t &&
          t <= parseFloat(data[i + 1].timeStamp)
        ) {
          prev = data[i];
          next = data[i + 1];
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

      const pos = new window.google.maps.LatLng(lat, lng);
      movingMarkerRef.current?.setPosition(pos);

      setCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) });

      const accuracyValue = prev.Accuracy ? parseFloat(prev.Accuracy) : 0;
      setAccuracy((accuracyValue * 100).toFixed(2));

      const dist = calcDistance(
        parseFloat(data[0].Latitude),
        parseFloat(data[0].Longitude),
        lat,
        lng
      );
      setDistance(dist.toFixed(1));

      // Update covered and remaining route polylines
      if (
        movingMarkerRef.current?.fullPath &&
        coveredPolylineRef.current &&
        remainingPolylineRef.current
      ) {
        const fullPath = movingMarkerRef.current.fullPath;
        const currentIndex = Math.floor(
          (t / parseFloat(data[data.length - 1].timeStamp)) * fullPath.length
        );

        // Split the path into covered and remaining parts
        const coveredPath = fullPath.slice(0, currentIndex + 1);
        const remainingPath = fullPath.slice(currentIndex);

        // Update the polylines
        coveredPolylineRef.current.setPath(coveredPath);
        remainingPolylineRef.current.setPath(remainingPath);
      }

      // Continue animation if video is playing
      if (!video.paused) {
        animationId = requestAnimationFrame(updateMarker);
      }
    };

    // Start animation loop
    animationId = requestAnimationFrame(updateMarker);

    // Handle video events
    const handlePlay = () => {
      animationId = requestAnimationFrame(updateMarker);
    };

    const handlePause = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    const handleSeek = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      updateMarker();
      if (!video.paused) {
        animationId = requestAnimationFrame(updateMarker);
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeked", handleSeek);
    video.addEventListener("loadedmetadata", updateMarker);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeked", handleSeek);
      video.removeEventListener("loadedmetadata", updateMarker);
    };
  }, [video, map, data]);

  const formatTime = (t: number) => {
    if (!t) return "0:00";
    const min = Math.floor(t / 60);
    const sec = Math.floor(t % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (typeof window === "undefined") {
    return <div>Loading map...</div>;
  }

  // Check if Google Maps is available
  if (!window.google) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div
          style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "500" }}
        >
          Google Maps not loaded
        </div>
        <div style={{ fontSize: "14px", color: "#666", maxWidth: "400px" }}>
          Please add your Google Maps API key to the environment variables.
          <br />
          <br />
          1. Get an API key from Google Cloud Console
          <br />
          2. Enable Maps JavaScript API and Geometry Library
          <br />
          3. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file
        </div>
      </div>
    );
  }

  // Show loading state if no data
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <div>No GPS data available</div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <MetadataPopover>
        <div className="space-y-2 text-sm text-neutral-700">
          {/* Time */}
          <MetadataColumn
            icon={<Image src={"/time.svg"} alt="Time" width={16} height={16} />}
            data={formatTime(timestamp)}
          />

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

          {/* Distance */}
          <MetadataColumn
            icon={
              <Image
                src={"/Distance.svg"}
                alt="Distance"
                width={16}
                height={16}
              />
            }
            data={`${distance} m`}
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

          {/* Accuracy */}
          {state?.toLowerCase() === "madhya pradesh" && (
            <MetadataColumn
              icon={
                <Image
                  src={"/Distance.svg"}
                  alt="Distance"
                  width={16}
                  height={16}
                />
              }
              data={`${accuracy} m`}
            />
          )}
        </div>
      </MetadataPopover>

      {/* Custom Hover Tooltip */}
      {hoverInfo && (
        <div
          className="absolute z-[10000] pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            transform: "translate(0, -100%)",
          }}
        >
          <TooltipProvider>
            <div className="bg-popover text-popover-foreground rounded-md border px-3 py-2 text-sm shadow-md animate-in fade-in-0 zoom-in-95">
              <div className="font-semibold text-foreground mb-2 pb-1 border-b">
                Route Info
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-muted-foreground">Time:</span>
                  <span className="text-xs font-semibold text-green-600">
                    {hoverInfo.timestamp}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-muted-foreground">Lat:</span>
                  <span className="text-xs font-mono text-red-600">
                    {hoverInfo.lat}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-muted-foreground">Lng:</span>
                  <span className="text-xs font-mono text-red-600">
                    {hoverInfo.lng}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center mt-2 pt-1 border-t">
                Click to seek to this point
              </div>
            </div>
          </TooltipProvider>
        </div>
      )}

      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "400px",
          backgroundColor: "#f0f0f0",
        }}
      />
    </div>
  );
};
