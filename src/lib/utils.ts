import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";
import Papa from "papaparse";

// Tailwind class merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sumTimestamps(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

// Format time in seconds to M:SS or MM:SS format
export function formatTime(t: number): string {
  if (!t) return "0:00";
  const min = Math.floor(t / 60);
  const sec = Math.floor(t % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}
const avatarColors = [
  { bg: "bg-green-200", text: "text-green-800" },
  { bg: "bg-blue-200", text: "text-blue-800" },
  { bg: "bg-red-200", text: "text-red-800" },
  { bg: "bg-yellow-200", text: "text-yellow-800" },
  { bg: "bg-purple-200", text: "text-purple-800" },
  { bg: "bg-pink-200", text: "text-pink-800" },
  { bg: "bg-indigo-200", text: "text-indigo-800" },
];

export const getRandomAvatarColor = () => {
  const randomIndex = Math.floor(Math.random() * avatarColors.length);
  return avatarColors[randomIndex];
};

interface TrackPoint {
  Latitude: number;
  Longitude: number;
  Accuracy?: number;
  Timestamp?: string | number;
}

const convertToGeoJSON = (points: TrackPoint[]) => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: points.map((p) => [p.Longitude, p.Latitude]),
      },
      properties: {},
    },
  ],
});

function geojsonToKml(geojson: any) {
  const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>`;

  const kmlFooter = `</Document></kml>`;

  const convertCoords = (coords: any) => coords.join(",");

  const convertGeometry = (geometry: any) => {
    switch (geometry.type) {
      case "LineString":
        return `<LineString><coordinates>${geometry.coordinates
          .map(convertCoords)
          .join(" ")}</coordinates></LineString>`;

      case "Point":
        return `<Point><coordinates>${convertCoords(
          geometry.coordinates
        )}</coordinates></Point>`;

      default:
        return "";
    }
  };

  const features = (geojson.features || [geojson])
    .map((f: any) => {
      const name = f.properties?.name ?? "Track";
      const geometry = convertGeometry(f.geometry);
      return `
<Placemark>
  <name>${name}</name>
  ${geometry}
</Placemark>`;
    })
    .join("\n");

  return `${kmlHeader}${features}${kmlFooter}`;
}

const downloadBlob = (blob: Blob, filename: string) => {
  console.log(blob, "blob");
  console.log(filename, "filename");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  URL.revokeObjectURL(url);
  a.remove();
};

const downloadCSV = (points: TrackPoint[], name: string) => {
  const csv = Papa.unparse(points);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${name}.csv`);
};

const downloadKML = (kml: string, name: string) => {
  const blob = new Blob([kml], {
    type: "application/vnd.google-earth.kml+xml",
  });
  downloadBlob(blob, `${name}.kml`);
};

// Helper functions to generate file data without downloading
export const generateCSVData = (points: TrackPoint[]): string => {
  return Papa.unparse(points);
};

export const generateKMLData = (points: TrackPoint[]): string => {
  const geoJSON = convertToGeoJSON(points);
  return geojsonToKml(geoJSON);
};

export const generateTrackFiles = async (gpsTrackId: string) => {
  try {
    const { data, error } = await supabase
      .from("gps_tracks")
      .select("location_data, name")
      .eq("id", gpsTrackId)
      .single();

    if (error) {
      console.error("Error fetching GPS track:", error);
      return null;
    }

    const points: TrackPoint[] = data.location_data;
    const csv = generateCSVData(points);
    const kml = generateKMLData(points);

    return {
      name: data.name,
      csv,
      kml,
    };
  } catch (err) {
    console.error("Error generating track files:", err);
    return null;
  }
};

export const handleDownloadGeoJSON = async (gpsTrackId: string) => {
  try {
    const { data, error } = await supabase
      .from("gps_tracks")
      .select("location_data, name")
      .eq("id", gpsTrackId)
      .single();

    if (error) {
      console.error("Error fetching GPS track:", error);
      return;
    }

    const points: TrackPoint[] = data.location_data;

    const geoJSON = convertToGeoJSON(points);
    const kml = geojsonToKml(geoJSON);

    downloadCSV(points, data.name);
    downloadKML(kml, data.name);

    console.log("Files downloaded:", data.name);
  } catch (err) {
    console.error("Error downloading GPS data:", err);
  }
};

export const handleDownloadVideo = async (surveyId: string) => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .select("url, name, mux_playback_id")
      .eq("survey_id", surveyId)
      .single();

    if (error) {
      console.error("Error fetching video:", error);
      return;
    }

    if (!data?.url) {
      console.error("No video URL found");
      return;
    }

    const fileName = data.name?.endsWith(".mp4")
      ? data.name
      : `${data.name}.mp4`;

    const a = document.createElement("a");
    a.href = data.url;
    a.download = fileName;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error("Error downloading video:", err);
  }
};

// Calculate distance between two coordinates using Haversine formula
export const calcDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Smooth GPS points for polyline using moving average
export const getSmoothedPath = (
  points: any[],
  windowSize: number = 3
): any[] => {
  if (!points || points.length === 0) return [];
  if (typeof window === "undefined" || !window.google?.maps?.LatLng) {
    // Fallback if Google Maps is not available
    return points.map((point) => ({
      lat: parseFloat(point.Latitude),
      lng: parseFloat(point.Longitude),
    }));
  }

  return points.map((point, idx, arr) => {
    const start = Math.max(0, idx - Math.floor(windowSize / 2));
    const end = Math.min(arr.length, idx + Math.floor(windowSize / 2));
    const slice = arr.slice(start, end);
    const lat =
      slice.reduce((sum, p) => sum + parseFloat(p.Latitude), 0) / slice.length;
    const lng =
      slice.reduce((sum, p) => sum + parseFloat(p.Longitude), 0) / slice.length;
    return new window.google.maps.LatLng(lat, lng);
  });
};

async function downloadM3U8AsMP4(m3u8Url: string, filename: string) {
  try {
    // Fetch M3U8 playlist
    const response = await fetch(m3u8Url);
    const m3u8Content = await response.text();

    // Parse segment URLs
    const lines = m3u8Content.split("\n").filter((line) => line.trim());
    const segments = [];

    for (const line of lines) {
      if (line && !line.startsWith("#")) {
        let segmentUrl = line.trim();
        if (!segmentUrl.startsWith("http")) {
          const base = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);
          segmentUrl = base + segmentUrl;
        }
        segments.push(segmentUrl);
      }
    }

    console.log(`Found ${segments.length} segments`);

    // Download all segments
    const downloadedSegments = [];
    for (let i = 0; i < segments.length; i++) {
      console.log(`Downloading segment ${i + 1}/${segments.length}`);
      const res = await fetch(segments[i]);
      const arrayBuffer = await res.arrayBuffer();
      downloadedSegments.push(arrayBuffer);
    }

    // Merge segments
    const totalLength = downloadedSegments.reduce(
      (sum, seg) => sum + seg.byteLength,
      0
    );
    const merged = new Uint8Array(totalLength);
    let offset = 0;

    for (const segment of downloadedSegments) {
      merged.set(new Uint8Array(segment), offset);
      offset += segment.byteLength;
    }

    // Create and download blob
    const blob = new Blob([merged], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("Download complete!");
    return true;
  } catch (error) {
    console.error("Download failed:", error);
    return false;
  }
}
