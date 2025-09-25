import { calcDistance } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export function useVideoGeolocation(videoRef : React.RefObject<HTMLVideoElement | null>, locationData : any[]) {
    const [coords, setCoords] = useState({ lat: 0, lng: 0 });
    const [distance, setDistance] = useState(0);

  
    useEffect(() => {
      if (!videoRef.current || !locationData.length) return;
  
      const updateLocation = () => {
        const t = videoRef.current?.currentTime;
        let prev = locationData[0];
        let next = locationData[locationData.length - 1];
  
        for (let i = 0; i < locationData.length - 1; i++) {
          if (
            parseFloat(locationData[i].timeStamp) <= t! &&
            t! <= parseFloat(locationData[i + 1].timeStamp)
          ) {
            prev = locationData[i];
            next = locationData[i + 1];
            break;
          }
        }
  
        const ratio =
          (t! - parseFloat(prev.timeStamp)) /
          (parseFloat(next.timeStamp) - parseFloat(prev.timeStamp));
  
        const lat =
          parseFloat(prev.Latitude) +
          ratio * (parseFloat(next.Latitude) - parseFloat(prev.Latitude));
        const lng =
          parseFloat(prev.Longitude) +
          ratio * (parseFloat(next.Longitude) - parseFloat(prev.Longitude));
  
        setCoords({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
  
        const dist = calcDistance(
          parseFloat(locationData[0].Latitude),
          parseFloat(locationData[0].Longitude),
          lat,
          lng
        );
        setDistance(parseFloat(dist.toFixed(1)));
      };
  
      videoRef.current?.addEventListener("timeupdate", updateLocation);
      videoRef.current.addEventListener("seeked", updateLocation);
      updateLocation();
  
      return () => {
        videoRef.current?.removeEventListener("timeupdate", updateLocation);
        videoRef.current?.removeEventListener("seeked", updateLocation);
      };
    }, [ locationData]);
  
    return { coords, distance };
  }
  