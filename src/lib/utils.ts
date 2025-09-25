import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const calcDistance = (
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

export const getSmoothedPath = (points: any[], windowSize = 3) => {
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
    return {lat, lng}
  });
};

export const formatTime = (t: number) => {
  if (!t) return "0:00";
  const min = Math.floor(t / 60);
  const sec = Math.floor(t % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
};