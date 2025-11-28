// @ts-nocheck
"use client";
import { useRef } from "react";

export const VideoProgressBar = ({ value, onChange, className = "" }) => {
  const progressRef = useRef(null);

  const handleClick = (e) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    onChange(percentage);
  };

  return (
    <div
      ref={progressRef}
      className={`relative w-full h-2 bg-gray-600 rounded-full cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div
        className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-150"
        style={{ width: `${value}%` }}
      />
      <div
        className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-150 hover:scale-110"
        style={{ left: `calc(${value}% - 6px)` }}
      />
    </div>
  );
};
