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

    // console.log("Files downloaded:", data.name);
  } catch (err) {
    console.error("Error downloading GPS data:", err);
  }
};

export const handleDownloadVideo = async (surveyId: string) => {
  try {
    const videoQuery = await supabase
      .from("videos")
      .select("url, name")
      .eq("survey_id", surveyId)
      .single();
    const surveyQuery = await supabase
      .from("surveys")
      .select("gps_track_id, gps_tracks(location_data)")
      .eq("id", surveyId)
      .single();

    console.log(surveyQuery.data);
    console.log(videoQuery.data);
    if (videoQuery.error || surveyQuery.error) {
      console.error(
        "Error fetching video:",
        videoQuery.error || surveyQuery.error
      );
      return;
    }

    if (!videoQuery.data?.url) {
      console.error("No video URL found");
      return;
    }

    const blob = await processVideoWithCoords(
      videoQuery.data.url,
      surveyQuery.data.gps_tracks.location_data
    );

    const url = URL.createObjectURL(blob as Blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${videoQuery.data.name}_with_gps_overlay.webm`;
    a.click();
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

export async function processVideoWithCoords(videoUrl: string, coords: any[]) {
  return new Promise(async (resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = videoUrl;
    await video.play();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      resolve(blob);
    };

    recorder.start();
    requestAnimationFrame(drawFrame);

    function getCoord(t: number) {
      for (let i = 0; i < coords.length - 1; i++) {
        if (t >= coords[i].Timestamp && t < coords[i + 1].Timestamp)
          return coords[i];
      }
      return coords[coords.length - 1];
    }

    function drawFrame() {
      if (video.ended) {
        recorder.stop();
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const t = video.currentTime * 1000; // convert seconds → ms
      const c = getCoord(t);

      if (c) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(20, 20, 380, 100);

        ctx.font = "22px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(`Lat: ${c.Latitude}`, 30, 55);
        ctx.fillText(`Lng: ${c.Longitude}`, 30, 85);
        ctx.fillText(`Acc: ${c.Accuracy}m`, 200, 55);
        ctx.fillText(
          `Time: ${new Date(c.Timestamp).toLocaleTimeString()}`,
          200,
          85
        );
      }

      requestAnimationFrame(drawFrame);
    }
  });
}
