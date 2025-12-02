"use client";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useVideo } from "@/lib/video-store";

const VideoSphere = () => {
  const { video } = useVideo();
  const sphere = useRef(null);
  const texture = useMemo(
    () => (video ? new THREE.VideoTexture(video) : null),
    [video]
  );

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  return (
    <mesh ref={sphere}>
      <sphereGeometry args={[500, 32, 24]} />
      <meshBasicMaterial side={THREE.BackSide} map={texture} />
    </mesh>
  );
};

export default VideoSphere;
