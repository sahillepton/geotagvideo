import { useEffect, useRef } from "react";

export const useMap = (data : any[]) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef(null);
  

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        const firstPoint = data[0];
    
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
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
      }, [ data]);


    return {mapRef}
}