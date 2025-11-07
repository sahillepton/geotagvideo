"use client";
import { useEffect, useRef, useState } from "react";

const Map = ({ data }: { data: any[] }) => {
  // Check if we're on the client side

  const mapRef = useRef<HTMLDivElement>(null);
  const movingMarkerRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const coveredPolylineRef = useRef<any>(null);
  const remainingPolylineRef = useRef<any>(null);
  const shadowPolylineRef = useRef<any>(null);
  const [map, setMap] = useState<any>(null);

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
    }, 100);

    return () => {
      clearTimeout(timer);
      // Google Maps cleanup is handled automatically
    };
  }, [mapRef, map, data]);

  // Smooth marker movement with requestAnimationFrame

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
    <div className="relative w-full h-screen mt-2 rounded">
      <div
        ref={mapRef}
        className="w-full h-full min-h-[400px] bg-gray-100 rounded"
      />
    </div>
  );
};

export default Map;
