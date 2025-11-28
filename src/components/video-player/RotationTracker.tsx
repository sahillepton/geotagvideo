// @ts-nocheck
"use client";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export const RotationTracker = ({ onRotationChange }) => {
  const { camera } = useThree();
  const dir = new THREE.Vector3();

  useFrame(() => {
    if (!camera) return;

    camera.getWorldDirection(dir);

    let angle = Math.atan2(dir.x, dir.z) * (180 / Math.PI);
    angle = (angle + 360) % 360;

    onRotationChange?.(angle);
  });

  return null;
};
