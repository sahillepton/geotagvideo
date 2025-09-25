import { useEffect, useRef } from "react"

type HandleSetHoverInfo = {
    timestamp: string;
    lat: string;
    lng: string;
} 

export const usePolylines = (smoothedPath: any[], mapRef : any, movingMarker : any, handleSetMousePosition : ({x, y}: {x: number, y: number}) => void, data : any[], handleSetHoverInfo : ({timestamp, lat, lng} : HandleSetHoverInfo ) => void, handleClearHoverInfo : () => void, videoRef : React.RefObject<HTMLVideoElement | null>) => {
    const shadowPolylineRef = useRef(null);
    const coveredPolylineRef = useRef(null);
    const remainingPolylineRef = useRef(null);
    useEffect(() => {
        if(!mapRef.current || !videoRef.current) return;
        const shadowPolyline = new window.google.maps.Polyline({
            path: smoothedPath,
            geodesic: true,
            strokeColor: "#1F2937",
            strokeOpacity: 0.3,
            strokeWeight: 8,
            map: mapRef.current,
            clickable: false,
          });
      
          shadowPolylineRef.current = shadowPolyline;
      
          const coveredPolyline = new window.google.maps.Polyline({
            path: [],
            geodesic: true,
            strokeColor: "#10B981",
            strokeOpacity: 0.9,
            strokeWeight: 6,
            map: mapRef.current,
            clickable: true,
          });
      
          coveredPolylineRef.current = coveredPolyline;
      
          const remainingPolyline = new window.google.maps.Polyline({
            path: smoothedPath,
            geodesic: true,
            strokeColor: "#8B5CF6",
            strokeOpacity: 0.9,
            strokeWeight: 6,
            map: mapRef.current,
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
      
          movingMarker.fullPath = smoothedPath;


          mapRef.current.addEventListener("mousemove", (e : any) => {
            const rect = mapRef.current?.getBoundingClientRect();
            handleSetMousePosition({
              x: e.clientX - rect?.left!,
              y: e.clientY - rect?.top!,
            });
          });
      
          const handleRouteHover = (event: any) => {
            const clickedLatLng = event.latLng;
      
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
      
              const formatTime = (t: number) => {
                if (!t) return "0:00";
                const minutes = Math.floor(t / 60);
                const seconds = Math.floor(t % 60);
                return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
              };
      
              handleSetHoverInfo({
                timestamp: formatTime(timestamp),
                lat,
                lng,
              });
            }
          };
      
          const handleRouteMouseOut = () => {
            handleClearHoverInfo();
          };

          const handleRouteClick = (event: any) => {
            const clickedLatLng = event.latLng;
      
            let closestPoint = data[0];
            let minDistance = Infinity;
      
            data.forEach((point) => {
              const pointLatLng = mapRef.current.LatLng(
                parseFloat(point.Latitude),
                parseFloat(point.Longitude)
              );
              const distance =
                mapRef.current.geometry.spherical.computeDistanceBetween(
                  clickedLatLng,
                  pointLatLng
                );
      
              if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
              }
            });
      
            if (videoRef.current && closestPoint) {
              let timestamp = null;
      
              if (closestPoint.timeStamp !== undefined) {
                timestamp = parseFloat(closestPoint.timeStamp);
              }
      
              if (timestamp !== null && !isNaN(timestamp)) {
                videoRef.current.currentTime = timestamp;
              } else {
                console.error(
                  "No valid timestamp found in closest point:",
                  closestPoint
                );
              }
            }
          };

          
      
          coveredPolyline.addListener("mouseover", handleRouteHover);
          coveredPolyline.addListener("mouseout", handleRouteMouseOut);
          remainingPolyline.addListener("mouseover", handleRouteHover);
          remainingPolyline.addListener("mouseout", handleRouteMouseOut);
      
           coveredPolyline.addListener("click", handleRouteClick);
           remainingPolyline.addListener("click", handleRouteClick);
      
          const bounds = new window.google.maps.LatLngBounds();
          smoothedPath.forEach((point) => bounds.extend(point));
          mapRef.current.fitBounds(bounds);
    },[smoothedPath])

    return {shadowPolylineRef, coveredPolylineRef, remainingPolylineRef}
}