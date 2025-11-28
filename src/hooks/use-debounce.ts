import { useEffect } from "react";

export function useDebounce<T>(
  value: T,
  delay: number = 500,
  callback?: (value: T) => void
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (callback) {
        callback(value);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, callback]);
}
