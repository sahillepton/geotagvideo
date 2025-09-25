import { useEffect, useRef } from "react"

export const useMarkers = (mapRef : any, firstPoint : {Latitude : string, Longitude : string}, lastPoint : {Latitude : string, Longitude : string}) => {


    const startMarkerRef = useRef(null);
    const endMarkerRef = useRef(null);
    const movingMarkerRef = useRef(null);

    useEffect(() => {
      if (!mapRef.current.maps) return;
        const startMarker = mapRef.current?.maps.Marker({
            position: {
              lat: parseFloat(firstPoint.Latitude),
              lng: parseFloat(firstPoint.Longitude),
            },
            map: mapRef.current,
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
      
          const endMarker = mapRef.current?.maps.Marker({
            position: {
              lat: parseFloat(lastPoint.Latitude),
              lng: parseFloat(lastPoint.Longitude),
            },
            map: mapRef.current,
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
      
          const movingMarker = mapRef.current?.maps.Marker({
            position: {
              lat: parseFloat(firstPoint.Latitude),
              lng: parseFloat(firstPoint.Longitude),
            },
            map: mapRef.current,
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
    }, [firstPoint, lastPoint])

    return {startMarkerRef, endMarkerRef, movingMarkerRef}

}

