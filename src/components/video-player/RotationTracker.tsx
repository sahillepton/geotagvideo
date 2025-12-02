"use client";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRotation } from "@/lib/video-store";

const RotationTracker = () => {
  const { camera } = useThree();
  const { setRotationAngle } = useRotation();
  const dir = new THREE.Vector3();

  useFrame(() => {
    if (!camera) return;

    camera.getWorldDirection(dir);

    let angle = Math.atan2(dir.x, dir.z) * (180 / Math.PI);
    angle = (angle + 360) % 360;

    setRotationAngle(angle);
  });

  return null;
};

export default RotationTracker;
