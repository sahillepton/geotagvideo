// @ts-nocheck
"use client";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

export const VideoSphere = ({ video }) => {
  const sphere = useRef();
  const texture = useMemo(() => new THREE.VideoTexture(video), [video]);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  return (
    <mesh ref={sphere}>
      {/* Reduced geometry complexity for better performance */}
      <sphereGeometry args={[500, 32, 24]} />
      <meshBasicMaterial side={THREE.BackSide} map={texture} />
    </mesh>
  );
};
