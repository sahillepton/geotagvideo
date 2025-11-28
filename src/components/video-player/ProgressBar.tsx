// @ts-nocheck
"use client";
import { useRef } from "react";

export const ProgressBar = ({ value, onChange, className = "", isVolume }) => {
  const progressRef = useRef(null);

  const handleClick = (e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    onChange(isVolume ? percentage / 100 : percentage);
  };

  return (
    <div
      ref={progressRef}
      className={`relative ${
        isVolume ? "w-20" : "w-full"
      } h-2 bg-gray-700 rounded-full cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div
        className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-150"
        style={{ width: `${isVolume ? value * 100 : value}%` }}
      />
      <div
        className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-150 hover:scale-125"
        style={{ left: `calc(${isVolume ? value * 100 : value}% - 6px)` }}
      />
    </div>
  );
};
